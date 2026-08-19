'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-red-900/40 border border-red-500 p-6 rounded-2xl max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-red-200 mb-2">Terjadi Kesalahan!</h2>
        <p className="text-sm text-red-300 mb-4">{error.message || 'Gagal memuat halaman photobooth.'}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}