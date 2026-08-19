'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QRCodePage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const [eventUrl, setEventUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEventUrl(`${window.location.origin}/e/${slug}`);
    }
  }, [slug]);

  const qrImageUrl = eventUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`
    : '';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">QR Code Event</h1>
          <p className="text-xs text-slate-400 mt-1">Scan untuk membuka Photobooth Live</p>
        </div>

        {qrImageUrl ? (
          <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
            <img src={qrImageUrl} alt="QR Code" className="w-64 h-64 mx-auto rounded-lg" />
          </div>
        ) : (
          <div className="w-64 h-64 bg-slate-700 animate-pulse mx-auto rounded-2xl flex items-center justify-center text-xs text-slate-400">
            Generating QR Code...
          </div>
        )}

        <p className="text-[11px] text-indigo-400 font-mono break-all bg-slate-900 p-3 rounded-xl border border-slate-700">
          {eventUrl}
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-2xl transition"
        >
          ← Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
