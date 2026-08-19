'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TenantSettingsPage() {
  const searchParams = useSearchParams();
  const [tenant, setTenant] = useState({
    id: 'DEMO-TENANT-UUID', // Nanti diambil dari sesi login Supabase Auth
    google_email: null,
  });

  const successMessage = searchParams.get('success');
  const errorMessage = searchParams.get('error');

  const handleConnectDrive = () => {
    // Arahkan ke endpoint OAuth dengan membawa tenantId
    window.location.href = `/api/auth/google-client?tenantId=${tenant.id}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-2">Pengaturan Integrasi Penyimpanan</h1>
      <p className="text-sm text-gray-400 mb-6">
        Hubungkan akun Google Drive milik usaha/EO kamu agar seluruh hasil foto acara langsung tersimpan di penyimpananku sendiri.
      </p>

      {successMessage === 'drive_connected' && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-xl text-green-300 text-sm">
          ✅ Berhasil! Google Drive kamu telah terhubung secara aman.
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-300 text-sm">
          ❌ Gagal menghubungkan Google Drive. Silakan coba lagi.
        </div>
      )}

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Google Drive Storage</h3>
          <p className="text-xs text-gray-400 mt-1">
            Status Terhubung:{' '}
            <span className={tenant.google_email ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>
              {tenant.google_email ? tenant.google_email : 'Belum Terhubung'}
            </span>
          </p>
        </div>

        <button
          onClick={handleConnectDrive}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          {tenant.google_email ? 'Ganti Akun Drive' : 'Hubungkan Google Drive'}
        </button>
      </div>
    </div>
  );
}