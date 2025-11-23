import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function Gallery() {
  const { allProfiles } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'images', 'videos'
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      
      snapshot.docs.forEach(doc => {
        const postData = doc.data();
        
        // Extraer todos los archivos multimedia del post
        let mediaFiles = [];
        
        // Nuevo formato (array de media)
        if (postData.media && Array.isArray(postData.media)) {
          mediaFiles = postData.media.map(m => ({
            url: m.url,
            type: m.type,
            postId: doc.id,
            authorId: postData.authorId,
            authorName: postData.authorName,
            timestamp: postData.timestamp,
            title: postData.title,
            content: postData.content
          }));
        } 
        // Formato antiguo (imageURL o videoURL)
        else {
          if (postData.imageURL) {
            mediaFiles.push({
              url: postData.imageURL,
              type: 'image/jpeg',
              postId: doc.id,
              authorId: postData.authorId,
              authorName: postData.authorName,
              timestamp: postData.timestamp,
              title: postData.title,
              content: postData.content
            });
          }
          if (postData.videoURL) {
            mediaFiles.push({
              url: postData.videoURL,
              type: 'video/mp4',
              postId: doc.id,
              authorId: postData.authorId,
              authorName: postData.authorName,
              timestamp: postData.timestamp,
              title: postData.title,
              content: postData.content
            });
          }
        }
        
        items.push(...mediaFiles);
      });
      
      setMediaItems(items);
      setFilteredItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar cuando cambian los filtros
  useEffect(() => {
    let filtered = [...mediaItems];

    // Filtrar por autor
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(item => item.authorId === selectedAuthor);
    }

    // Filtrar por tipo
    if (selectedType === 'images') {
      filtered = filtered.filter(item => item.type.startsWith('image/'));
    } else if (selectedType === 'videos') {
      filtered = filtered.filter(item => item.type.startsWith('video/'));
    }

    setFilteredItems(filtered);
  }, [selectedAuthor, selectedType, mediaItems]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getAuthorProfile = (authorId) => {
    return allProfiles.find(p => p.id === authorId);
  };

  const openLightbox = (item, index) => {
    setLightbox({ item, index });
  };

  const closeLightbox = () => {
    setLightbox(null);
  };

  const nextImage = () => {
    if (lightbox && lightbox.index < filteredItems.length - 1) {
      setLightbox({
        item: filteredItems[lightbox.index + 1],
        index: lightbox.index + 1
      });
    }
  };

  const prevImage = () => {
    if (lightbox && lightbox.index > 0) {
      setLightbox({
        item: filteredItems[lightbox.index - 1],
        index: lightbox.index - 1
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando galería...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Filtros */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por autor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por familiar:
            </label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              {allProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.shortName || profile.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de archivo:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedType('images')}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedType === 'images'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📷 Fotos
              </button>
              <button
                onClick={() => setSelectedType('videos')}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedType === 'videos'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎥 Videos
              </button>
            </div>
          </div>

          {/* Contador */}
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-500">Total:</div>
            <div className="text-2xl font-bold text-indigo-600">
              {filteredItems.length}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de medios */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No hay archivos multimedia
          </h3>
          <p className="text-gray-600">
            {selectedAuthor !== 'all' || selectedType !== 'all'
              ? 'Intenta cambiar los filtros'
              : 'Sube fotos o videos en tus publicaciones'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => {
            const authorProfile = getAuthorProfile(item.authorId);
            
            return (
              <div
                key={`${item.postId}-${index}`}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => openLightbox(item, index)}
              >
                {item.type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.title || 'Imagen'}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative">
                    <video
                      src={item.url}
                      className="w-full h-64 object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-5xl">▶️</span>
                    </div>
                  </div>
                )}

                {/* Overlay con info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {authorProfile?.photoURL ? (
                        <img
                          src={authorProfile.photoURL}
                          alt={item.authorName}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-sm">
                          {item.authorName[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {item.authorName}
                        </div>
                        <div className="text-white/80 text-xs">
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    {item.title && (
                      <div className="text-white text-sm font-medium truncate">
                        {item.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge del tipo */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {item.type.startsWith('image/') ? '📷' : '🎥'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
          >
            ✕
          </button>

          {/* Botón anterior */}
          {lightbox.index > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 text-white text-5xl hover:text-gray-300 z-10"
            >
              ‹
            </button>
          )}

          {/* Botón siguiente */}
          {lightbox.index < filteredItems.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 text-white text-5xl hover:text-gray-300 z-10"
            >
              ›
            </button>
          )}

          {/* Contenido */}
          <div className="max-w-6xl max-h-[90vh] mx-auto p-4" onClick={(e) => e.stopPropagation()}>
            {lightbox.item.type.startsWith('image/') ? (
              <img
                src={lightbox.item.url}
                alt={lightbox.item.title}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            ) : (
              <video
                src={lightbox.item.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] mx-auto"
              />
            )}

            {/* Info del post */}
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-bold mb-2">{lightbox.item.title}</h3>
              <p className="text-gray-300 mb-2">{lightbox.item.content}</p>
              <div className="text-sm text-gray-400">
                Por {lightbox.item.authorName} • {formatDate(lightbox.item.timestamp)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {lightbox.index + 1} de {filteredItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}