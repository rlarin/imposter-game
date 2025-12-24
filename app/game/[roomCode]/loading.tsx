export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin text-4xl mb-4">🎮</div>
        <p className="text-gray-600 dark:text-gray-400">Cargando partida...</p>
      </div>
    </div>
  );
}
