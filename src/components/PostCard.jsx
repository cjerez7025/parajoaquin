import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function PostCard({ post, onUpdate }) {
  const { currentUser, allProfiles } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Buscar el perfil del autor
  const authorProfile = allProfiles.find(p => p.id === post.authorId);

  const isLiked = post.likes?.includes(currentUser?.id);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  // Obtener todos los archivos multimedia
  const getMediaFiles = () => {
    // Si tiene el nuevo formato (post.media array)
    if (post.media && Array.isArray(post.media)) {
      return post.media;
    }
    
    // Si tiene formato antiguo (imageURL o videoURL individual)
    const oldMedia = [];
    if (post.imageURL) {
      oldMedia.push({ url: post.imageURL, type: 'image/jpeg' });
    }
    if (post.videoURL) {
      oldMedia.push({ url: post.videoURL, type: 'video/mp4' });
    }
    
    return oldMedia;
  };

  const mediaFiles = getMediaFiles();

  const handleLike = async () => {
    try {
      const postRef = doc(db, 'posts', post.id);
      
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.id)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.id)
        });
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      const postRef = doc(db, 'posts', post.id);
      
      const comment = {
        id: Date.now().toString(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      };

      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      setNewComment('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await deleteDoc(doc(db, 'posts', post.id));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 mb-5">
        {/* Header del Post */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {authorProfile?.photoURL ? (
              <img 
                src={authorProfile.photoURL}
                alt={post.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl">
                {post.authorName[0]}
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-gray-800">{post.authorName}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatDate(post.timestamp)}</span>
                {authorProfile?.role && (
                  <>
                    <span>•</span>
                    <span>{authorProfile.role}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botón eliminar si es el autor */}
          {currentUser?.id === post.authorId && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar publicación"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Contenido del Post */}
        <div className="mb-4">
          {post.title && (
            <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
          )}
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Galería de medios */}
        {mediaFiles.length > 0 && (
          <div className={`mb-4 ${
            mediaFiles.length === 1 ? '' : 
            mediaFiles.length === 2 ? 'grid grid-cols-2 gap-2' :
            mediaFiles.length === 3 ? 'grid grid-cols-3 gap-2' :
            'grid grid-cols-2 gap-2'
          }`}>
            {mediaFiles.map((media, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl group">
                {media.type.startsWith('image/') ? (
                  <>
                    <img 
                      src={media.url} 
                      alt={`Media ${index + 1}`}
                      onClick={() => setLightboxImage(media.url)}
                      className="w-full h-64 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍
                      </span>
                    </div>
                  </>
                ) : (
                  <video 
                    src={media.url}
                    controls 
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
                {/* Contador si hay múltiples archivos */}
                {mediaFiles.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}/{mediaFiles.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Acciones del Post */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
              <span className="font-medium">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
            >
              <span className="text-lg">💬</span>
              <span className="font-medium">{commentsCount}</span>
            </button>
          </div>

          {/* Sección de Comentarios */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {/* Comentarios existentes */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario de nuevo comentario */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Enviar
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox para ver imágenes en grande */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ✕
          </button>
          <img 
            src={lightboxImage}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}