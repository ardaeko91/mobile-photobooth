'use client';

export default function AdminError({ error, reset }) {
  return (
    <div className="p-8 bg-red-950 text-red-200 rounded-xl m-4 border border-red-800">
      <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan di Panel Admin</h2>
      <p className="text-sm mb-4">{error?.message || 'Gagal memuat komponen dashboard.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
      >
        Coba Lagi
      </button>
    </div>
  );
}