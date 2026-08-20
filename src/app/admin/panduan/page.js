'use client';

export default function PanduanAdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span class="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-full uppercase tracking-widest">
            Portal Admin Tenant
          </span>
          <h1 className="text-xl font-extrabold text-white">Panduan Alur kerja Owner Photobooth</h1>
          <p className="text-slate-400 text-xs">Petunjuk langkah demi langkah mengelola akun dan event.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="w-full h-28 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700/50">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white font-bold text-xs flex items-center justify-center rounded-lg">1</span>
              <h3 className="font-bold text-xs text-white">Registrasi Akun Baru</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Daftar akun baru. Status awal adalah <span className="text-amber-400 font-semibold">PENDING</span> hingga diverifikasi Super Admin.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="w-full h-28 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700/50">
              <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white font-bold text-xs flex items-center justify-center rounded-lg">2</span>
              <h3 className="font-bold text-xs text-white">Verifikasi Langganan</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Setelah pembayaran sewa terverifikasi, status akun menjadi <span className="text-emerald-400 font-semibold">AKTIF</span>.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="w-full h-28 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700/50">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white font-bold text-xs flex items-center justify-center rounded-lg">3</span>
              <h3 className="font-bold text-xs text-white">Atur Event & Drive</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Upload frame PNG dan tempelkan Link Google Drive agar foto tamu otomatis tersimpan rapi.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="w-full h-28 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700/50">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white font-bold text-xs flex items-center justify-center rounded-lg">4</span>
              <h3 className="font-bold text-xs text-white">Cetak QR Code Event</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tampilkan QR Code event di booth acara agar tamu bisa langsung scan dan ambil foto.
            </p>
          </div>

        </div>

        <div className="text-center pt-2">
          <button 
            onClick={() => window.close()}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
}