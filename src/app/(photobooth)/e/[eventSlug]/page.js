'use client';

import { useState, useRef, useEffect, use } from 'react';

export default function PhotoboothPage({ params }) {
  const unwrappedParams = use(params);
  const eventSlug = unwrappedParams.eventSlug;
  const tenantId = '00000000-0000-0000-0000-000000000000';

  const [step, setStep] = useState('CAPTURE');
  const [photos, setPhotos] = useState([null, null, null]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventSlug]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success && data.events) {
        const found = data.events.find((e) => e.slug === eventSlug);
        if (found) setEventData(found);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoadingEvent(false);
    }
  };

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error('Audio beep error:', e);
    }
  };

  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.error('Audio shutter error:', e);
    }
  };

  useEffect(() => {
    if (!loadingEvent && eventData && eventData.is_active !== false && step === 'CAPTURE') {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => alert('Gagal mengakses kamera: ' + err.message));
    }
  }, [step, eventData, loadingEvent]);

  const startCountdown = (slotIndex) => {
    if (countdown !== null) return;
    setActiveSlot(slotIndex);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      playBeep();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      playShutterSound();
      capturePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const newPhotos = [...photos];
    newPhotos[activeSlot] = dataUrl;
    setPhotos(newPhotos);

    const nextSlot = newPhotos.findIndex((p) => p === null);
    if (nextSlot !== -1) {
      setActiveSlot(nextSlot);
    }
  };

  const resetAllPhotos = () => {
    setPhotos([null, null, null]);
    setActiveSlot(0);
    setPreviewImage(null);
  };

  const renderPhotoStripBlob = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const width = 600;
      const height = 1800;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const hasCustomFrame = Boolean(eventData?.frame_url);

      if (!hasCustomFrame) {
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(eventSlug.replace('-', ' ').toUpperCase(), width / 2, 110);

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase();
        const timeStr = now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        ctx.fillStyle = '#64748B';
        ctx.font = '600 20px sans-serif';
        ctx.fillText(`${dateStr} • ${timeStr} WIB`, width / 2, 150);
      }

      const loadImg = (src) =>
        new Promise((res) => {
          if (!src) return res(null);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = src;
        });

      Promise.all([
        loadImg(photos[0]),
        loadImg(photos[1]),
        loadImg(photos[2]),
        loadImg(eventData?.frame_url || null)
      ]).then(([img1, img2, img3, frameImg]) => {
        const loadedPhotos = [img1, img2, img3];
        const photoWidth = 520;
        const photoHeight = 390;
        const startX = 40;
        const startY = 200;
        const gap = 25;

        loadedPhotos.forEach((image, i) => {
          if (!image) return;
          const y = startY + i * (photoHeight + gap);

          const imgAspect = image.width / image.height;
          const targetAspect = photoWidth / photoHeight;
          let renderWidth, renderHeight, offsetX, offsetY;

          if (imgAspect > targetAspect) {
            renderHeight = image.height;
            renderWidth = image.height * targetAspect;
            offsetX = (image.width - renderWidth) / 2;
            offsetY = 0;
          } else {
            renderWidth = image.width;
            renderHeight = image.width / targetAspect;
            offsetX = 0;
            offsetY = (image.height - renderHeight) / 2;
          }

          ctx.drawImage(
            image,
            offsetX,
            offsetY,
            renderWidth,
            renderHeight,
            startX,
            y,
            photoWidth,
            photoHeight
          );
        });

        if (frameImg) {
          ctx.drawImage(frameImg, 0, 0, width, height);
        }

        ctx.fillStyle = '#64748B';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        
        const textBase = "Mobile_photobooth v1.0 | developed by ";
        const textLink = "@ardaeko";
        
        ctx.fillText(textBase, width / 2 - 35, height - 35);
        ctx.fillStyle = '#4F46E5';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(textLink, width / 2 + 130, height - 35);

        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
      });
    });
  };

  const handleGoToReview = async () => {
    setStep('REVIEW');
    const blob = await renderPhotoStripBlob();
    if (blob) {
      setPreviewImage(URL.createObjectURL(blob));
    }
  };

  const handleFinalUpload = async () => {
    setStep('UPLOADING');
    setUploading(true);

    try {
      const blob = await renderPhotoStripBlob();
      const file = new File([blob], `strip_${eventSlug}_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenantId', tenantId);
      formData.append('eventSlug', eventSlug);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server status ${res.status}`);
      }

      if (res.ok) {
        setStep('SUCCESS');
      } else {
        alert(`Gagal: ${data.error || 'Server Error'}`);
        setStep('REVIEW');
      }
    } catch (err) {
      alert(`Error koneksi: ${err.message}`);
      setStep('REVIEW');
    } finally {
      setUploading(false);
    }
  };

  if (loadingEvent) {
    return (
      <main className="h-[100dvh] w-full bg-slate-100 flex items-center justify-center p-4">
        <p className="text-xs font-semibold text-slate-400 animate-pulse">Memuat Photobooth...</p>
      </main>
    );
  }

  // LOKASI PENCEGATAN EVENT OFFLINE
  if (eventData && eventData.is_active === false) {
    return (
      <main className="h-[100dvh] w-full bg-slate-100 flex items-center justify-center p-4 text-center font-sans">
        <div className="bg-white p-6 rounded-3xl shadow-xl max-w-xs space-y-3 border border-slate-200">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h1 className="text-base font-bold text-slate-800">Sesi Photobooth Ditutup</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Akses photobooth untuk event ini sedang dinonaktifkan oleh panitia/admin.
          </p>
        </div>
      </main>
    );
  }

  const allPhotosCaptured = photos.every((p) => p !== null);

  return (
    <main className="h-[100dvh] w-full bg-slate-100 text-slate-800 flex flex-col justify-between p-3 overflow-hidden font-sans">
      <canvas ref={canvasRef} className="hidden" />

      <header className="text-center py-1 flex-shrink-0">
        <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
          {eventSlug.replace('-', ' ')}
        </h1>
        <p className="text-[10px] text-slate-500">Live Mobile Photobooth</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-xs mx-auto my-auto">
        {step === 'CAPTURE' && (
          <div className="w-full flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-md border-2 border-white flex-shrink-0">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-7xl font-black text-white animate-ping">{countdown}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              {photos.map((src, i) => (
                <div key={i} className="flex flex-col gap-1 items-center">
                  <div
                    className={`relative w-full aspect-[4/3] rounded-xl border-2 overflow-hidden flex items-center justify-center transition-all ${
                      activeSlot === i ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-300 bg-slate-200'
                    }`}
                  >
                    {src ? (
                      <img src={src} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">#{i + 1}</span>
                    )}
                  </div>
                  <button
                    onClick={() => startCountdown(i)}
                    disabled={countdown !== null}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[10px] rounded-lg shadow-sm active:scale-95 transition"
                  >
                    Foto #{i + 1}
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full space-y-2 pt-1">
              <button
                onClick={resetAllPhotos}
                disabled={countdown !== null}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Reset Semua Foto
              </button>

              {allPhotosCaptured && (
                <button
                  onClick={handleGoToReview}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs transition"
                >
                  Lihat Hasil Foto Strip →
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'REVIEW' && (
          <div className="w-full flex flex-col items-center justify-center my-auto space-y-3">
            <div className="w-[170px] aspect-[1/3] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {previewImage ? (
                <img src={previewImage} alt="Preview Photo Strip" className="w-full h-full object-contain" />
              ) : (
                <div className="text-[10px] text-slate-400">Rendering preview...</div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-[170px] pt-1">
              <button
                onClick={handleFinalUpload}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shadow-md transition"
              >
                Simpan Ke Drive
              </button>
              <button
                onClick={() => setStep('CAPTURE')}
                className="w-full py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300 transition"
              >
                Ubah Foto
              </button>
            </div>
          </div>
        )}

        {(step === 'UPLOADING' || step === 'SUCCESS') && (
          <div className="w-full bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center flex flex-col items-center justify-center my-auto">
            {uploading ? (
              <div className="space-y-3 py-6">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">Mengunggah foto...</p>
              </div>
            ) : (
              <div className="space-y-4 py-2 w-full">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h2 className="text-base font-bold text-slate-800">Foto Berhasil Disimpan!</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Silakan hubungi operator/admin acara di area lokasi untuk mencetak atau mendapatkan file foto kamu.
                </p>

                <button
                  onClick={() => {
                    resetAllPhotos();
                    setStep('CAPTURE');
                  }}
                  className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Sesi Foto Baru
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center py-0.5 flex-shrink-0">
        <p className="text-[9px] text-slate-400">
          Mobile_photobooth v1.0 | developed by{' '}
          <a
            href="https://www.instagram.com/ardaeko/"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 font-bold hover:underline"
          >
            @ardaeko
          </a>
        </p>
      </footer>
    </main>
  );
}
