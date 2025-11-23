import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import PostCard from './PostCard';

export default function Timeline() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = () => {
    // El onSnapshot ya maneja las actualizaciones en tiempo real
    console.log('Posts actualizados');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando publicaciones...</div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No hay publicaciones aún
          </h3>
          <p className="text-gray-600">
            Sé el primero en compartir un mensaje para Joaquín
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}