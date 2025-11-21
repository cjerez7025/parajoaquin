import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PostForm() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'posts'), {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        title: title.trim(),
        content: content.trim(),
        timestamp: serverTimestamp()
      });

      setTitle('');
      setContent('');
      alert('¡Publicación creada! 💙');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ Nueva Publicación</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Título..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
        />

        <textarea
          placeholder="Escribe tu mensaje para Joaquín..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg rounded-xl hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? '⏳ Publicando...' : '💌 Publicar'}
        </button>
      </form>
    </div>
  );
}