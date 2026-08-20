import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col justify-between items-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Spacer Atas */}
      <div className="w-full" />

      {/* Content Utama di Tengah */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        
        {/* Header Judul & Sub-judul */}
        <div className="space-y-3 mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Welcome
          </h1>
          <p className="text-[11px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Phone Photobooth v2.1
          </p>
        </div>

        {/* Action Buttons (Lebar disesuaikan dengan teks Welcome) */}
        <div className="w-full max-w-[280px] flex flex-col gap-3">
          
          {/* Tombol Login */}
          <Link
            href="/login"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 border border-indigo-400/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 group"
          >
            <svg
              className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574v9.176c0 1.22.98 2.2 2.2 2.2h15.1c1.22 0 2.2-.98 2.2-2.2V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
            <span>Masuk ke Dashboard</span>
          </Link>

          {/* Tombol Register */}
          <Link
            href="/register"
            className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-bold text-xs rounded-2xl border border-slate-700/80 backdrop-blur-md transition-all duration-200 active:scale-95"
          >
            Daftar Akun Tenant Baru
          </Link>

        </div>
      </div>

      {/* Footer Watermark */}
      <footer className="z-10 py-4 text-center">
        <a
          href="https://www.instagram.com/ardaeko/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-slate-500 hover:text-indigo-400 transition-colors duration-200 tracking-wide"
        >
          Phone Photobooth v2.1 | developed by <span className="font-bold underline decoration-indigo-500/50">@ardaeko</span>
        </a>
      </footer>

    </main>
  );
}