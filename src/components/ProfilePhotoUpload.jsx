import { useState } from 'react';

export default function ProfilePhotoUpload({ currentPhoto, onPhotoSelect }) {
  const [preview, setPreview] = useState(currentPhoto || null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La foto debe ser menor a 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pasar archivo al componente padre
      onPhotoSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Preview de la foto */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Botón para cambiar foto */}
        <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        Haz clic en la cámara para cambiar tu foto
      </p>
      <p className="text-xs text-gray-500">
        Máximo 5MB - JPG, PNG o GIF
      </p>
    </div>
  );
}