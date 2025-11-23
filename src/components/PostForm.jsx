import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function PostForm() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

 const handleFiles = (selectedFiles) => {
  // Filtrar solo imágenes y videos
  const validFiles = selectedFiles.filter(file => 
    file.type.startsWith('image/') || file.type.startsWith('video/')
  );

  if (validFiles.length === 0) {
    alert('Solo puedes subir imágenes o videos');
    return;
  }

  // Limitar a 5 archivos
  if (files.length + validFiles.length > 5) {
    alert('Máximo 5 archivos por publicación');
    return;
  }

  setFiles(prev => [...prev, ...validFiles]);

  // Crear previews
  validFiles.forEach(file => {
    if (file.type.startsWith('image/')) {
      // Para imágenes usar FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          url: reader.result,
          type: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // Para videos usar URL.createObjectURL (más rápido)
      const videoURL = URL.createObjectURL(file);
      setPreviews(prev => [...prev, {
        url: videoURL,
        type: file.type,
        name: file.name
      }]);
    }
  });
};

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const uploadFile = async (file, index) => {
    const timestamp = Date.now();
    const fileName = `posts/${currentUser.id}/${timestamp}_${index}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Por favor escribe un mensaje');
      return;
    }

    setLoading(true);

    try {
      // Subir archivos primero
      const uploadedURLs = [];
      
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], i);
        uploadedURLs.push({
          url: url,
          type: files[i].type
        });
      }

      // Crear el post
      const postData = {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        title: title.trim(),
        content: content.trim(),
        timestamp: serverTimestamp(),
        likes: [],
        comments: []
      };

      // Agregar URLs de archivos
      if (uploadedURLs.length > 0) {
        postData.media = uploadedURLs;
        
        // Por compatibilidad, agregar imageURL si hay imágenes
        const firstImage = uploadedURLs.find(m => m.type.startsWith('image/'));
        if (firstImage) {
          postData.imageURL = firstImage.url;
        }
        
        // Por compatibilidad, agregar videoURL si hay videos
        const firstVideo = uploadedURLs.find(m => m.type.startsWith('video/'));
        if (firstVideo) {
          postData.videoURL = firstVideo.url;
        }
      }

      await addDoc(collection(db, 'posts'), postData);

      // Limpiar formulario
      setTitle('');
      setContent('');
      setFiles([]);
      setPreviews([]);
      
      alert('¡Publicación creada! 💙');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji);
  };

  const commonEmojis = ['❤️', '💙', '😊', '🎉', '🎂', '🎈', '⭐', '✨', '🌟', '💝', '🥰', '😍'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ Nueva Publicación</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <input
            type="text"
            placeholder="Título (opcional)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Contenido */}
        <div>
          <textarea
            placeholder="Escribe tu mensaje para Joaquín..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition"
          />
          <div className="flex justify-between items-center mt-2 px-2">
            <span className="text-sm text-gray-500">
              {content.length} caracteres
            </span>
          </div>
        </div>

        {/* Emojis rápidos */}
        <div className="flex flex-wrap gap-2">
          {commonEmojis.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-2xl hover:scale-125 transition-transform"
              title="Agregar emoji"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Zona de Drag & Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-600 font-medium">
            Arrastra fotos o videos aquí
          </p>
          <p className="text-sm text-gray-500 mt-1">
            o haz clic para seleccionar (máximo 5 archivos)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

{/* Previews de archivos */}
{previews.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {previews.map((preview, index) => (
      <div key={index} className="relative group">
        {preview.type.startsWith('image/') ? (
          <img 
            src={preview.url} 
            alt={`Preview ${index}`}
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="relative">
            <video 
              src={preview.url}
              className="w-full h-32 object-cover rounded-lg"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <span className="text-4xl">▶️</span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => removeFile(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        >
          ✕
        </button>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
          {preview.type.startsWith('image/') ? '📷 Foto' : '🎥 Video'}
        </div>
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {index + 1}
        </div>
      </div>
    ))}
  </div>
)}

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Publicando...' : '💌 Publicar'}
        </button>
      </form>
    </div>
  );
}