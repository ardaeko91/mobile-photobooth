export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white text-center">
      <h1 className="text-3xl font-bold mb-4">Mobile Photobooth SaaS</h1>
      <p className="text-gray-400 mb-6">Sistem siap digunakan!</p>
      <a 
        href="/e/demo-event" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition"
      >
        Buka Kamera Event (Demo)
      </a>
    </div>
  );
}