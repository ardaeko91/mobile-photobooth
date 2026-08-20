'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventDriveUrl, setNewEventDriveUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // State Modal Edit Drive Link
  const [editDriveModal, setEditDriveModal] = useState(null);
  const [driveInput, setDriveInput] = useState('');
  const [savingDrive, setSavingDrive] = useState(false);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Cek Status Suspend / Profile Tenant dari Database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Jika profile berstatus suspended / expired, paksa logout!
      if (profile && (profile.status === 'suspended' || profile.status === 'SUSPENDED' || profile.is_suspended)) {
        alert('Akun Anda sedang ditangguhkan (SUSPENDED). Silakan hubungi Super Admin.');
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      // Cek juga dari tabel tenants jika profil disimpan di tabel tenants
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tenantData && (tenantData.status === 'suspended' || tenantData.status === 'SUSPENDED')) {
        alert('Akun Tenant Anda dalam status SUSPENDED. Silakan hubungi Super Admin.');
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setCurrentUser(user);
      await fetchEvents(user.id);
    } catch (err) {
      console.error('Error init dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle || !newEventSlug) return alert('Isi Nama Event dan Slug!');

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('events')
        .insert([
          {
            title: newEventTitle,
            name: newEventTitle,
            slug: newEventSlug.toLowerCase().replace(/\s+/g, '-'),
            drive_folder_url: newEventDriveUrl || null,
            user_id: user.id,
            status: 'online',
            is_active: true,
          },
        ]);

      if (error) {
        alert(`Gagal: ${error.message}`);
      } else {
        setNewEventTitle('');
        setNewEventSlug('');
        setNewEventDriveUrl('');
        fetchEvents(user.id);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateDriveUrl = async (e) => {
    e.preventDefault();
    if (!editDriveModal) return;

    setSavingDrive(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ drive_folder_url: driveInput })
        .eq('id', editDriveModal.id);

      if (error) {
        alert(`Gagal simpan: ${error.message}`);
      } else {
        setEvents((prev) =>
          prev.map((item) =>
            item.id === editDriveModal.id ? { ...item, drive_folder_url: driveInput } : item
          )
        );
        setEditDriveModal(null);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingDrive(false);
    }
  };

  const handleToggleActive = async (eventId, currentStatus) => {
    const nextStatus = !currentStatus;
    const nextStatusText = nextStatus ? 'online' : 'offline';

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, is_active: nextStatus, status: nextStatusText } : e))
    );

    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: nextStatus, status: nextStatusText })
        .eq('id', eventId);

      if (error) {
        alert(`Gagal update DB: ${error.message}`);
        if (currentUser) fetchEvents(currentUser.id);
      }
    } catch (err) {
      alert(`Error koneksi toggle: ${err.message}`);
      if (currentUser) fetchEvents(currentUser.id);
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}" secara permanen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (!error) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        alert(`Gagal menghapus: ${error.message}`);
      }
    } catch (err) {
      alert(`Error hapus: ${err.message}`);
    }
  };

  const filteredEvents = events.filter((e) => {
    const title = (e.title || e.name || '').toLowerCase();
    const slug = (e.slug || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || slug.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 font-sans flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto space-y-5">
        
        {/* Header Tenant - Email & Info User */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-base font-bold text-slate-900">Dashboard Tenant</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <span className="font-semibold text-indigo-600">{currentUser?.email || 'Memuat...'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Google Drive Connected
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Form Buat Event Baru */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Buat Event Baru</h2>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nama Event (misal: Demo Wedding)"
              value={newEventTitle}
              onChange={(e) => {
                setNewEventTitle(e.target.value);
                setNewEventSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <input
              type="text"
              placeholder="Slug URL (misal: demo-wedding)"
              value={newEventSlug}
              onChange={(e) => setNewEventSlug(e.target.value)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <input
              type="text"
              placeholder="Link Folder Google Drive (Opsional)"
              value={newEventDriveUrl}
              onChange={(e) => setNewEventDriveUrl(e.target.value)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={creating}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {creating ? 'Membuat Event...' : '+ Tambah Event'}
            </button>
          </form>
        </div>

        {/* List Daftar Event */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Event ({filteredEvents.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Memuat daftar event...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              {searchQuery ? 'Tidak ada event yang cocok dengan pencarian.' : 'Belum ada event. Buat event pertama kamu di atas!'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((e) => {
                const photoboothUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${e.slug}`;
                const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(photoboothUrl)}`;
                const driveLink = e.drive_folder_url || (e.drive_folder_id ? `https://drive.google.com/drive/folders/${e.drive_folder_id}` : 'https://drive.google.com');
                const isActive = e.is_active !== false && e.status !== 'offline';

                return (
                  <div
                    key={e.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/90 rounded-xl hover:border-slate-300 transition gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{e.title || e.name}</h3>
                        {!isActive ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">OFFLINE</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">ONLINE</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">/e/{e.slug}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(e.id, isActive)}
                        title={isActive ? 'Nonaktifkan Photobooth' : 'Aktifkan Photobooth'}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'ONLINE' : 'OFFLINE'}
                      </button>

                      <Link
                        href={`/dashboard/events/${e.id}`}
                        className="p-2.5 bg-white text-indigo-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Frame Generator Studio / Galeri"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                        </svg>
                      </Link>

                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-white text-amber-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Buka Folder Google Drive"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setEditDriveModal({ id: e.id, title: e.title || e.name });
                          setDriveInput(e.drive_folder_url || '');
                        }}
                        className="p-2.5 bg-white text-blue-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Atur / Tempel Link Google Drive"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveQrUrl({ title: e.title || e.name, qr: qrApiUrl, url: photoboothUrl })}
                        className="p-2.5 bg-white text-purple-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Tampilkan QR Code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <path strokeLinecap="round" d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h2v3h-2z" />
                        </svg>
                      </button>

                      <a
                        href={`/e/${e.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-white text-emerald-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Buka Photobooth Client"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(e.id, e.title || e.name)}
                        className="p-2.5 bg-red-50 text-red-600 border border-red-200/80 rounded-xl hover:bg-red-100 transition shadow-sm"
                        title="Hapus Event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Edit Drive Link */}
      {editDriveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Atur Link Google Drive</h3>
              <button
                onClick={() => setEditDriveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Tempel link folder Google Drive khusus untuk event: <span className="font-bold text-slate-800">{editDriveModal.title}</span>
            </p>

            <form onSubmit={handleUpdateDriveUrl} className="space-y-3">
              <input
                type="text"
                placeholder="https://drive.google.com/drive/folders/..."
                value={driveInput}
                onChange={(e) => setDriveInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditDriveModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingDrive}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
                >
                  {savingDrive ? 'Menyimpan...' : 'Simpan Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {activeQrUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">QR Code Photobooth</h3>
              <button
                onClick={() => setActiveQrUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-semibold text-indigo-600">{activeQrUrl.title}</p>

            <div className="w-48 h-48 mx-auto bg-slate-50 p-2 border border-slate-200 rounded-2xl flex items-center justify-center">
              <img src={activeQrUrl.qr} alt="QR Code" className="w-full h-full object-contain" />
            </div>

            {/* Pesan Edukasi */}
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 font-medium leading-relaxed">
              💡 Disarankan scan menggunakan <b>Google Lens</b> atau <b>Google Chrome</b> di HP agar bisa langsung berfoto tanpa login.
            </p>

            <p className="text-[10px] text-slate-400 break-all">{activeQrUrl.url}</p>

            {/* Tombol Download Poster QR Siap Cetak */}
            <button
              onClick={() => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 600;
                canvas.height = 800;

                // 1. Background Putih
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 2. Judul Event (Atas)
                ctx.fillStyle = '#4F46E5';
                ctx.font = 'bold 32px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(activeQrUrl.title || 'Photobooth Event', canvas.width / 2, 80);

                // 3. Render Gambar QR Code (Tengah)
                const qrImg = new Image();
                qrImg.crossOrigin = 'anonymous';
                qrImg.src = activeQrUrl.qr;
                qrImg.onload = () => {
                  ctx.drawImage(qrImg, 100, 130, 400, 400);

                  // 4. Background Kotak Edukasi (Bawah)
                  ctx.fillStyle = '#FFFBEB';
                  ctx.strokeStyle = '#FDE68A';
                  ctx.lineWidth = 3;
                  
                  // Draw Rounded Rectangle Manual
                  const x = 50, y = 570, w = 500, h = 160, r = 20;
                  ctx.beginPath();
                  ctx.moveTo(x + r, y);
                  ctx.lineTo(x + w - r, y);
                  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                  ctx.lineTo(x + w, y + h - r);
                  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                  ctx.lineTo(x + r, y + h);
                  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                  ctx.lineTo(x, y + r);
                  ctx.quadraticCurveTo(x, y, x + r, y);
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();

                  // 5. Teks Edukasi dalam Kotak
                  ctx.fillStyle = '#B45309';
                  ctx.font = 'bold 20px sans-serif';
                  ctx.fillText('💡 Disarankan scan menggunakan', canvas.width / 2, 620);
                  
                  ctx.fillStyle = '#92400E';
                  ctx.font = 'bold 22px sans-serif';
                  ctx.fillText('Google Lens atau Google Chrome', canvas.width / 2, 660);

                  ctx.font = '20px sans-serif';
                  ctx.fillText('di HP agar bisa langsung berfoto tanpa login.', canvas.width / 2, 700);

                  // 6. Trigger Download File
                  const link = document.createElement('a');
                  link.download = `QR_${activeQrUrl.title.replace(/\s+/g, '_')}.jpg`;
                  link.href = canvas.toDataURL('image/jpeg', 0.95);
                  link.click();
                };
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <span>📥</span> Download QR Siap Cetak
            </button>

            <button
              onClick={() => setActiveQrUrl(null)}
              className="w-full py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Footer & Tombol Panduan Tenant */}
      <footer className="text-center py-6 text-[11px] text-slate-400 font-medium space-y-3">
        <div className="flex justify-center">
          <button
            onClick={() => window.open('/admin/panduan', 'PanduanTenant', 'width=600,height=750,scrollbars=yes')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2"
          >
            <span>📖</span> Lihat Panduan Penggunaan Tenant
          </button>
        </div>
        <p>
          Mobile_photobooth v1.0 | developed by{' '}
          <a href="https://instagram.com/ardaeko" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
            @ardaeko
          </a>
        </p>
      </footer>
    </div>
  );
}