import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { familyMembers, login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-light text-white mb-4">💙 Para Joaquín</h1>
          <p className="text-2xl text-white/90 mb-4">Un proyecto familiar lleno de amor</p>
          <p className="text-lg text-white/80">¿Quién quiere publicar hoy?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => login(member.id)}
              className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-5xl mb-3">{member.avatar}</div>
              <div className="text-lg font-bold text-gray-800">{member.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}