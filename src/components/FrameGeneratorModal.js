'use client';

import { useState, useRef, useEffect } from 'react';

export default function FrameGeneratorModal({ isOpen, onClose, onApplyFrame, eventSlug }) {
  const [primaryColor, setPrimaryColor] = useState('#00FFD2');
  const [secondaryColor, setSecondaryColor] = useState('#FF6B00');
  const [titleText, setTitleText] = useState('LARI 100KM BARENG');
  const [subTitleText, setSubTitleText] = useState('LUXARY MEDIA');
  const [bottomText, setBottomText] = useState('FINISHER • PHOTO STRIP');
  const [borderStyle, setBorderStyle] = useState('chiseled');

  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      drawCanvas();
    }
  }, [isOpen, primaryColor, secondaryColor, titleText, subTitleText, bottomText, borderStyle]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 600;
    const height = 1800;
    canvas.width = width;
    canvas.height = height;

    // 1. Clear Canvas (Pastikan area slot foto transparan)
    ctx.clearRect(0, 0, width, height);

    // 2. Border Luar Frame
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Speed Lines Aksen
    if (borderStyle === 'chiseled') {
      ctx.fillStyle = secondaryColor;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 300 + i * 20);
        ctx.lineTo(18, 280 + i * 20);
        ctx.lineTo(18, 290 + i * 20);
        ctx.lineTo(0, 310 + i * 20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(600, 1200 + i * 20);
        ctx.lineTo(582, 1180 + i * 20);
        ctx.lineTo(582, 1190 + i * 20);
        ctx.lineTo(600, 1210 + i * 20);
        ctx.fill();
      }
    }

    // 3. Header Text
    ctx.fillStyle = primaryColor;
    ctx.font = 'italic bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL PHOTOBOOTH', width / 2, 65);

    if (titleText) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic 900 34px sans-serif';
      ctx.shadowColor = secondaryColor;
      ctx.shadowBlur = 10;
      ctx.fillText(titleText.toUpperCase(), width / 2, 115);
      ctx.shadowBlur = 0;
    }

    if (subTitleText) {
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, 135);
      ctx.lineTo(width / 2 + 120, 135);
      ctx.lineTo(width / 2 + 110, 165);
      ctx.lineTo(width / 2 - 110, 165);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold italic 18px sans-serif';
      ctx.fillText(subTitleText.toUpperCase(), width / 2, 157);
    }

    // 4. Border 3 Slot Foto (Presisi 520x390)
    const photoWidth = 520;
    const photoHeight = 390;
    const startX = 40;
    const startY = 200;
    const gap = 25;

    for (let i = 0; i < 3; i++) {
      const y = startY + i * (photoHeight + gap);

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 6;

      if (borderStyle === 'chiseled') {
        const cut = 20;
        ctx.beginPath();
        ctx.moveTo(startX + cut, y);
        ctx.lineTo(startX + photoWidth - cut, y);
        ctx.lineTo(startX + photoWidth, y + cut);
        ctx.lineTo(startX + photoWidth, y + photoHeight - cut);
        ctx.lineTo(startX + photoWidth - cut, y + photoHeight);
        ctx.lineTo(startX + cut, y + photoHeight);
        ctx.lineTo(startX, y + photoHeight - cut);
        ctx.lineTo(startX, y + cut);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(startX - 4, y + 20);
        ctx.lineTo(startX - 4, y - 4);
        ctx.lineTo(startX + 20, y - 4);
        ctx.stroke();
      } else {
        ctx.strokeRect(startX, y, photoWidth, photoHeight);
      }

      ctx.fillStyle = secondaryColor;
      ctx.fillRect(startX + 10, y + 10, 45, 25);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold italic 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`0${i + 1}`, startX + 32, y + 27);
    }

    // 5. Custom Bottom Text (Finisher / Text Bawah)
    if (bottomText) {
      ctx.fillStyle = primaryColor;
      ctx.font = 'italic 900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bottomText.toUpperCase(), width / 2, 1530);
    }
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `generated_frame_${Date.now()}.png`, { type: 'image/png' });
      onApplyFrame(file);
      onClose();
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Form Controls */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-4 text-white">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-indigo-400">⚡ Generator Frame Studio</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Judul Event (Atas)</label>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Sub-Judul / Badge</label>
            <input
              type="text"
              value={subTitleText}
              onChange={(e) => setSubTitleText(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Teks Bawah / Finisher</label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="misal: FINISHER • PHOTO STRIP"
              className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Warna Utama</label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 bg-transparent rounded-lg cursor-pointer border-0"
                />
                <span className="text-xs font-mono text-slate-300">{primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Warna Aksen</label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 bg-transparent rounded-lg cursor-pointer border-0"
                />
                <span className="text-xs font-mono text-slate-300">{secondaryColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Gaya Border Foto</label>
            <select
              value={borderStyle}
              onChange={(e) => setBorderStyle(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="chiseled">Chiseled / Sudut Potong (Sporty)</option>
              <option value="solid">Solid Line (Minimalis)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleApply}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Gunakan Frame Ini
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="w-full md:w-1/2 bg-slate-950 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800">
          <p className="text-[10px] text-slate-500 mb-2 font-mono tracking-widest uppercase">LIVE CANVAS PREVIEW (600x1800)</p>
          <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] p-2">
            <canvas ref={canvasRef} className="max-h-[55vh] w-auto object-contain" />
          </div>
        </div>

      </div>
    </div>
  );
}
