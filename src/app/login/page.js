'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Format Link WhatsApp
  const waNumber = '6289637879506';
  const waMessage = encodeURIComponent(
    `Halo Admin, saya mencoba login tetapi akun saya belum diverifikasi.\n\n` +
    `*Email:* ${email}\n\n` +
    `Mohon bantuannya untuk verifikasi akun saya. Terima kasih!`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setIsPending(false);

    try {
      // 1. Auth Login Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;

      // 2. Jika Superadmin -> Langsung ke /admin
      if (user.email === 'ardaeko91@gmail.com' || user?.user_metadata?.role === 'superadmin') {
        router.push('/admin');
        router.refresh();
        return;
      }

      // 3. Cek Status Verifikasi di Tabel Profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Jika Status Pending / Belum Diverifikasi
      if (profile?.status !== 'active') {
        setIsPending(true);
        throw new Error('Akun Anda belum diverifikasi oleh Superadmin.');
      }

      // 4. Jika Aktif -> Masuk ke Dashboard Tenant
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Masuk ke Dashboard</h1>
          <p className="text-xs text-slate-400">Photobooth Multi-Tenant SaaS</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-semibold space-y-2">
            <p>{errorMsg}</p>
            
            {/* Tombol WA otomatis muncul jika status akun belum diverifikasi */}
            {isPending && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-md flex items-center justify-center gap-1.5 transition text-center mt-2"
              >
                <span>💬</span> Hubungi Superadmin via WhatsApp
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
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
              placeholder="••••••••"
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
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-600 font-bold hover:underline">
            Daftar Tenant Baru
          </Link>
        </p>
      </div>
    </div>
  );
}