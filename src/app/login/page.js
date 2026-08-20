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

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Coba Auth Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;

     // 2. Jika Superadmin -> Otomatis masuk ke Panel Super Admin (/admin)
      if (user.email === 'ardaeko91@gmail.com' || user?.user_metadata?.role === 'superadmin') {
        router.push('/admin');
        router.refresh();
        return;
      }

      // 3. Cek Status Verifikasi di Tabel PROFILES
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status, subscription_end')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Cek apakah status aktif (bisa 'active' atau 'AKTIF')
      const isActive = profile?.status === 'active' || profile?.status === 'AKTIF';

      // Cek apakah masa sewa masih berlaku
      const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();

      if (!profile || !isActive || isExpired) {
        await supabase.auth.signOut();
        if (isExpired) {
          throw new Error('Masa sewa/langganan Anda telah habis. Silakan hubungi Superadmin.');
        } else {
          throw new Error('Akun Anda belum diverifikasi oleh Superadmin.');
        }
      }

      // 4. Lolos Verifikasi -> Ke Dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Masuk ke Dashboard</h1>
          <p className="text-xs text-slate-400">Photobooth Multi-Tenant SaaS</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-semibold">
            {errorMsg}
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