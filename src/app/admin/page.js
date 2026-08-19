'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    initAdmin();
  }, []);

  const initAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      await fetchTenants();
    } catch (err) {
      console.error('Error init admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTenants(data);
    }
  };

  const handleActivate = async () => {
    if (!selectedTenant) return;

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          action: 'activate',
          durationMonths: duration,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (result.success) {
          alert(`Berhasil mengaktifkan ${selectedTenant.email} selama ${duration} Bulan!`);
          setSelectedTenant(null);
          fetchTenants();
        } else {
          alert(`Gagal: ${result.error}`);
        }
      } else {
        alert('Server mengembalikan respon non-JSON.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSuspend = async (tenant) => {
    if (!confirm(`Apakah Anda yakin ingin mematikan/suspend akses ${tenant.email}?`)) return;

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id, action: 'suspend' }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (result.success) {
          fetchTenants();
        } else {
          alert(`Gagal suspend: ${result.error}`);
        }
      } else {
        const textErr = await res.text();
        console.error('Respon bukan JSON:', textErr);
        alert('Gagal memproses request. Pastikan server Next.js berjalan.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getRemainingDays = (endDateStr) => {
    if (!endDateStr) return null;
    const now = new Date();
    const end = new Date(endDateStr);
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.business_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const daysLeft = getRemainingDays(t.subscription_end);
    let currentStatus = t.status || 'pending';

    if (currentStatus === 'active' && daysLeft !== null && daysLeft <= 0) {
      currentStatus = 'expired';
    }

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && currentStatus === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans text-xs">
        Memuat Panel Super Admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Super Admin */}
        <div className="flex justify-between items-center bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
              Panel Kontrol Super Admin
            </h1>
            <p className="text-xs text-slate-400">Verifikasi & Kelola Masa Langganan Client</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 transition"
          >
            Logout
          </button>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="🔍 Cari Email atau Nama Usaha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'pending', 'active', 'expired', 'suspended'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition border ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {st === 'pending' ? '⏳ Pending' : st === 'active' ? '🟢 Aktif' : st === 'expired' ? '🔴 Expired' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Tenant */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white">Daftar Tenant ({filteredTenants.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                  <th className="p-3">Email Client</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sisa Waktu Sewa</th>
                  <th className="p-3 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 text-xs">
                      Tidak ada tenant ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => {
                    const isSuperAdmin = t.role === 'super_admin';
                    const daysLeft = getRemainingDays(t.subscription_end);
                    let currentStatus = t.status || 'pending';

                    if (currentStatus === 'active' && daysLeft !== null && daysLeft <= 0) {
                      currentStatus = 'expired';
                    }

                    return (
                      <tr key={t.id} className="hover:bg-slate-700/30 transition">
                        <td className="p-3">
                          <p className="font-bold text-white">{t.email}</p>
                          <p className="text-[10px] text-slate-400">{t.business_name || 'Tenant Photobooth'}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                            isSuperAdmin ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {t.role || 'tenant'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-[9px] ${
                            currentStatus === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : currentStatus === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {currentStatus === 'pending' ? '⏳ PENDING' : currentStatus === 'active' ? '🟢 AKTIF' : currentStatus === 'expired' ? '🔴 EXPIRED' : '⛔ SUSPENDED'}
                          </span>
                        </td>
                        <td className="p-3">
                          {!isSuperAdmin && currentStatus === 'active' && daysLeft !== null ? (
                            <span className={`font-bold text-[11px] ${
                              daysLeft <= 7 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              Sisa {daysLeft} Hari
                            </span>
                          ) : !isSuperAdmin && currentStatus === 'expired' ? (
                            <span className="text-red-400 font-bold text-[11px]">Sewa Habis</span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {!isSuperAdmin ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedTenant(t)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-xl transition shadow"
                              >
                                {currentStatus === 'pending' ? 'Verifikasi & Aktifkan' : 'Perpanjang Sewa'}
                              </button>
                              {currentStatus === 'active' && (
                                <button
                                  onClick={() => handleSuspend(t)}
                                  className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] rounded-xl border border-red-500/20 transition"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Owner</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Set Durasi Langganan */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Atur Langganan Tenant</h3>
            <p className="text-xs text-slate-300">
              Pilih durasi aktif sewa untuk: <span className="font-bold text-indigo-400">{selectedTenant.email}</span>
            </p>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Durasi Sewa:</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1 Bulan</option>
                <option value={3}>3 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={12}>1 Tahun (12 Bulan)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleActivate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Simpan & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
