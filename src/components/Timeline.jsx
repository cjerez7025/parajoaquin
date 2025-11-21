import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import PostCard from './PostCard';

export default function Timeline() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    
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

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando publicaciones...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay publicaciones aún</h3>
        <p className="text-gray-600">Sé el primero en escribir algo para Joaquín</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📜 Publicaciones Recientes</h2>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}