'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState(null);
  
  const tenantId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle || !newEventSlug) return alert('Isi semua field event!');

    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          title: newEventTitle,
          slug: newEventSlug.toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNewEventTitle('');
        setNewEventSlug('');
        fetchEvents();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Toggle Online/Offline
  const handleToggleActive = async (eventId, currentStatus) => {
    const nextStatus = !currentStatus;

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, is_active: nextStatus } : e))
    );

    try {
      const res = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, is_active: nextStatus }),
      });
      
      const data = await res.json();
      if (!data.success) {
        alert(`Gagal update DB: ${data.error}`);
        fetchEvents();
      }
    } catch (err) {
      alert(`Error koneksi toggle: ${err.message}`);
      fetchEvents();
    }
  };

  // Hapus Event
  const handleDeleteEvent = async (eventId, title) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}" secara permanen?`)) {
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        alert(`Gagal menghapus: ${data.error}`);
      }
    } catch (err) {
      alert(`Error hapus: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans flex flex-col justify-between">
      <div className="w-full space-y-4">
        
        {/* Header Tenant */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-base font-bold text-slate-900">Dashboard Tenant</h1>
            <p className="text-[10px] text-slate-400">Kelola Event & Akses Photobooth</p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Google Drive Connected
          </span>
        </div>

        {/* Form Buat Event Baru */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <h2 className="text-xs font-bold text-slate-900">Buat Event Baru</h2>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nama Event (misal: Demo Wedding)"
              value={newEventTitle}
              onChange={(e) => {
                setNewEventTitle(e.target.value);
                setNewEventSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Slug URL (misal: demo-wedding)"
              value={newEventSlug}
              onChange={(e) => setNewEventSlug(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              {creating ? 'Membuat Event...' : '+ Tambah Event'}
            </button>
          </form>
        </div>

        {/* List Daftar Event */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xs font-bold text-slate-900">Daftar Event ({events.length})</h2>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Memuat daftar event...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Belum ada event. Buat event pertama kamu di atas!</div>
          ) : (
            <div className="space-y-2">
              {events.map((e) => {
                const photoboothUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${e.slug}`;
                const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(photoboothUrl)}`;
                const driveLink = e.drive_folder_id
                  ? `https://drive.google.com/drive/folders/${e.drive_folder_id}`
                  : 'https://drive.google.com';

                const isActive = e.is_active !== false;

                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{e.title}</h3>
                        {!isActive ? (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">OFFLINE</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">ONLINE</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">/e/{e.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Switch Active Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(e.id, isActive)}
                        title={isActive ? 'Nonaktifkan Photobooth' : 'Aktifkan Photobooth'}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'ONLINE' : 'OFFLINE'}
                      </button>

                      {/* Detail & Frame Studio */}
                      <Link
                        href={`/dashboard/events/${e.id}`}
                        className="p-2 bg-white text-indigo-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Frame Generator Studio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </Link>

                      {/* Folder Google Drive */}
                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white text-amber-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Folder Google Drive"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </a>

                      {/* QR Code Barcode */}
                      <button
                        type="button"
                        onClick={() => setActiveQrUrl({ title: e.title, qr: qrApiUrl, url: photoboothUrl })}
                        className="p-2 bg-white text-purple-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Tampilkan QR Code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </button>

                      {/* Buka Client Photobooth */}
                      <a
                        href={`/e/${e.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white text-emerald-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-sm"
                        title="Buka Photobooth Client"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      {/* Delete Event */}
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(e.id, e.title)}
                        className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition shadow-sm"
                        title="Hapus Event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Modal QR Code */}
      {activeQrUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

            <p className="text-[10px] text-slate-400 break-all">{activeQrUrl.url}</p>

            <button
              onClick={() => setActiveQrUrl(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <footer className="text-center py-4 text-[11px] text-slate-400 font-medium">
        Mobile_photobooth v1.0 | developed by{' '}
        <a href="https://instagram.com/ardaeko" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
          @ardaeko
        </a>
      </footer>
    </div>
  );
}
