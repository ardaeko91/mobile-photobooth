'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import FrameGeneratorModal from '@/components/FrameGeneratorModal';

export default function EventDetailPage({ params }) {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const { id: eventId } = use(params);
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFileId, setPreviewFileId] = useState(null);
  const [uploadingFrame, setUploadingFrame] = useState(false);

  // Initial Fetch & Auto Polling tiap 5 detik untuk reload foto otomatis
  useEffect(() => {
    fetchEventDetail();
    const interval = setInterval(() => {
      fetchEventDetail(true); // silent fetch tanpa spinner
    }, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchEventDetail = async (isSilent = false) => {
    try {
      const res = await fetch(`/api/events/detail?eventId=${eventId}`);
      const data = await res.json();
      if (data.success) {
        setEvent(data.event);
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const uploadFrameFile = async (file) => {
    if (!file) return;

    if (file.type !== 'image/png') {
      return alert('File frame harus berformat PNG transparan!');
    }

    setUploadingFrame(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    try {
      const res = await fetch('/api/events/frame', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setEvent((prev) => ({ ...prev, frame_url: data.frameUrl }));
        alert('Custom Frame Overlay berhasil diperbarui!');
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploadingFrame(false);
    }
  };

  const handleFrameUpload = async (e) => {
    const file = e.target.files[0];
    await uploadFrameFile(file);
  };

  const handleResetDefaultFrame = async () => {
    if (!confirm('Apakah kamu yakin ingin menggunakan Frame Default (Putih)?')) return;

    setUploadingFrame(true);
    try {
      const res = await fetch('/api/events/frame', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      setEvent((prev) => ({ ...prev, frame_url: null }));
      alert('Frame diset ke Default bawaan.');
    } catch (err) {
      setEvent((prev) => ({ ...prev, frame_url: null }));
      alert('Frame diset ke Default bawaan.');
    } finally {
      setUploadingFrame(false);
    }
  };

  const extractDriveId = (item) => {
    if (item.drive_file_id) return item.drive_file_id;
    if (item.drive_url) {
      const match = item.drive_url.match(/\/d\/([^\/]+)/) || item.drive_url.match(/id=([^&]+)/);
      if (match) return match[1];
    }
    return null;
  };

  const handlePrint = (fileId) => {
    if (!fileId) return alert('File ID tidak ditemukan!');
    const imageUrl = `/api/drive-image?fileId=${fileId}`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Photo Strip</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-width: 100%; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Memuat detail event...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans flex flex-col justify-between">
      <div className="w-full space-y-4">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              title="Kembali ke Dashboard"
              className="p-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900">{event?.title}</h1>
              <p className="text-[10px] text-slate-400">/e/{event?.slug}</p>
            </div>
          </div>

          <a
            href={`/e/${event?.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Buka Photobooth"
            className="p-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Panel Upload Custom Frame Overlay */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Custom Frame Overlay (PNG Transparan)</h2>
              <p className="text-[10px] text-slate-400">Unggah bingkai kostum yang otomatis menimpa canvas photo strip.</p>
            </div>
            {event?.frame_url ? (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                Custom Frame Aktif
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                Default Frame (Putih)
              </span>
            )}
          </div>

          <div className="flex items-stretch gap-4 pt-1">
            {/* Box Preview Thumbnail Frame (Ditinggikan setara tinggi 3 button) */}
            {event?.frame_url ? (
              <div className="w-24 h-[126px] bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-sm">
                <img src={event.frame_url} alt="Frame Overlay" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-24 h-[126px] bg-white border border-slate-200 rounded-xl shrink-0 flex flex-col items-center justify-center text-[9px] text-slate-400 text-center p-2 shadow-sm">
                <span className="font-bold text-slate-300 text-sm">OFF</span>
                <span>Default White</span>
              </div>
            )}

            {/* Aksi Tombol Bertingkat (Ukuran Disamakan w-56) */}
            <div className="flex flex-col justify-between gap-2 items-start">
              <label className="w-56 cursor-pointer py-2 px-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingFrame ? 'Mengunggah...' : 'Pilih File PNG Frame'}</span>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleFrameUpload}
                  disabled={uploadingFrame}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsGeneratorOpen(true)}
                disabled={uploadingFrame}
                className="w-56 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>⚡ Generate Frame Studio</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultFrame}
                disabled={uploadingFrame || !event?.frame_url}
                className="w-56 py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 rounded-xl font-medium text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <span>🗑️ Gunakan Default Frame</span>
              </button>
            </div>
          </div>
        </div>

        {/* Galeri Grid */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900">
              Galeri Foto ({photos.length})
            </h2>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Auto Sync Live
            </span>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-xs text-slate-400">Belum ada foto yang diambil pada event ini.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 max-h-[72vh] overflow-y-auto p-1">
              {photos.map((item) => {
                const fileId = extractDriveId(item);
                const proxyImageUrl = fileId
                  ? `/api/drive-image?fileId=${fileId}`
                  : '/placeholder.jpg';

                return (
                  <div
                    key={item.id}
                    className="w-[120px] border border-slate-200 rounded-xl p-1.5 bg-slate-50 space-y-1.5 group hover:border-indigo-400 hover:shadow-sm transition shrink-0"
                  >
                    <div className="w-full aspect-[1/3] bg-slate-200 rounded-lg overflow-hidden relative border border-slate-100">
                      <img
                        src={proxyImageUrl}
                        alt="Photo Strip"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/120x360?text=Gambar+Drive';
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => setPreviewFileId(fileId)}
                        title="Lihat Preview Foto"
                        className="w-full py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handlePrint(fileId)}
                        title="Cetak Photo Strip Ini"
                        className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center justify-center"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

      {previewFileId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3 shadow-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-800">Preview Photo Strip</span>
              <button
                onClick={() => setPreviewFileId(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="w-full max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex justify-center">
              <img
                src={`/api/drive-image?fileId=${previewFileId}`}
                alt="Preview Detail"
                className="h-full max-h-[68vh] object-contain"
              />
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => handlePrint(previewFileId)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Foto
              </button>
              <button
                onClick={() => setPreviewFileId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <FrameGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onApplyFrame={uploadFrameFile}
        eventSlug={event?.slug}
      />

      <footer className="text-center py-4 text-[11px] text-slate-400 font-medium">
        Mobile_photobooth v1.0 | developed by{' '}
        <a href="https://instagram.com/ardaeko" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
          @ardaeko
        </a>
      </footer>
    </div>
  );
}
