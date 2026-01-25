"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', name: '' });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'user' })
    });
    if (res.ok) router.push(`/login?phone=${form.phone}&role=user`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 mt-20">
        <h1 className="text-3xl font-bold text-white mb-6">Client Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white" />
          <input type="tel" placeholder="0712345678" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
            className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white" />
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
            Sign Up as Client
          </button>
        </form>
      </div>
    </div>
  );
}