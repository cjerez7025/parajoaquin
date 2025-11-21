export default function PostCard({ post }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Ahora';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-CL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{post.authorAvatar}</span>
        <div>
          <div className="font-bold text-gray-800">{post.authorName}</div>
          <div className="text-sm text-gray-500">{formatDate(post.timestamp)}</div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
    </div>
  );
}