'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function GalleryPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchGalleryData();
  }, [slug]);

  const fetchGalleryData = async () => {
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      setEvent(eventData);

      if (eventData) {
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false });

        setPhotos(photosData || []);
      }
    } catch (err) {
      console.error('Error fetch gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans text-xs">
        Memuat Galeri Foto...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              🖼️ Galeri Foto: {event?.name || event?.title || slug}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Daftar foto yang telah terambil di event ini</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition"
          >
            ← Kembali
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          {photos.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-700 rounded-2xl space-y-2">
              <p className="text-2xl">📷</p>
              <p>Belum ada foto terambil untuk event ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((p) => (
                <div key={p.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow">
                  <img src={p.photo_url || p.url} alt="Photo result" className="w-full h-48 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
