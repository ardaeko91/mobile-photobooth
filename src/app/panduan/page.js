'use client';

export default function PanduanUserPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-5 font-sans flex items-center justify-center">
      <div className="max-w-md w-full space-y-5">
        
        <div className="text-center space-y-1">
          <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full uppercase tracking-widest">
            Cara Pakai Photobooth
          </span>
          <h1 className="text-xl font-black text-white">4 Langkah Foto Seru!</h1>
          <p className="text-slate-400 text-xs">Langsung dari browser HP kamu tanpa install aplikasi.</p>
        </div>

        <div className="space-y-3">
          
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3.5">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
            </div>
            <div>
              <span className="text-[9px] font-bold text-rose-400 uppercase">Langkah 1</span>
              <h3 className="font-bold text-xs text-white">Scan QR Code</h3>
              <p className="text-[11px] text-slate-400">Scan QR Code yang ada di booth acara.</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3.5">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <span className="text-[9px] font-bold text-amber-400 uppercase">Langkah 2</span>
              <h3 class="font-bold text-xs text-white">Izinkan Kamera</h3>
              <p className="text-[11px] text-slate-400">Pilih "Izinkan / Allow" saat browser meminta akses kamera.</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3.5">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
            </div>
            <div>
              <span className="text-[9px] font-bold text-indigo-400 uppercase">Langkah 3</span>
              <h3 className="font-bold text-xs text-white">Pose & Ambil Foto</h3>
              <p className="text-[11px] text-slate-400">Ikuti hitungan mundur. Foto otomatis terpasang ke frame.</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </div>
            <div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase">Langkah 4</span>
              <h3 className="font-bold text-xs text-white">Simpan & Download</h3>
              <p className="text-[11px] text-slate-400">Klik Simpan. Foto langsung tersimpan ke galeri HP.</p>
            </div>
          </div>

        </div>

        <div className="text-center pt-1">
          <button 
            onClick={() => window.close()}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}