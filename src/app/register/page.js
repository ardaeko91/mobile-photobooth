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

      // 2. Gunakan Upsert dengan onConflict ID agar tidak bentrok dengan Trigger DB
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

        if (profileError) {
          console.error('Profile Update Error:', profileError);
        }
      }

      alert('Registrasi berhasil! Akun kamu sedang menunggu verifikasi dari Superadmin.');
      router.push('/login');
    } catch (err) {
      console.error('Register Catch Error:', err);
      setErrorMsg(err.message || 'Gagal mendaftar. Pastikan koneksi internet stabil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5">
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
    </div>
  );
}