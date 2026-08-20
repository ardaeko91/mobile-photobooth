'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Buat User Auth di Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            role: 'tenant',
          },
        },
      });

      if (authError) throw authError;

      // 2. Insert/Upsert Data ke Tabel PROFILES
      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: authData.user.id,
            email: email,
            business_name: businessName,
            role: 'tenant',
            status: 'pending',
          },
          { onConflict: 'id' }
        );

        if (profileError) throw profileError;
      }

      // Tampilkan Modal Pop-up Sukses
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Format Pesan WhatsApp
  const waNumber = '6289637879506';
  const waMessage = encodeURIComponent(
    `Halo Admin, saya baru saja mendaftar akun tenant Phone Photobooth v2.1.\n\n` +
    `*Email:* ${email}\n` +
    `*Nama Usaha:* ${businessName}\n\n` +
    `Mohon bantuannya untuk verifikasi akun saya. Terima kasih!`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800 relative">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5 z-10">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Daftar Akun Tenant</h1>
          <p className="text-xs text-slate-400">Mulai kelola Photobooth SaaS kamu</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Usaha / Brand</label>
            <input
              type="text"
              required
              placeholder="misal: Studio Foto Keren"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="email@bisnis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Login di sini
          </Link>
        </p>
      </div>

      {/* Pop-up Custom Modal Verifikasi WhatsApp */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Registrasi Berhasil!</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akun kamu telah dibuat dan sedang menunggu verifikasi Superadmin.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left space-y-1 text-xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Detail Akun Kamu:</p>
              <p className="font-semibold text-slate-700 truncate">📧 {email}</p>
              <p className="font-semibold text-slate-700 truncate">🏢 {businessName}</p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>💬</span> Hubungi Superadmin via WhatsApp
              </a>

              <button
                onClick={handleCloseModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
              >
                Nanti Saja (Ke Login)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}