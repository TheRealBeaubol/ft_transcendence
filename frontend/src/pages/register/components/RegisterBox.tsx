import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterBox() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erreur inconnue lors de l\'inscription');
        return;
      }
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Impossible de contacter le serveur');
    }
  };  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleRegister}
          className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-6">
          <input type="mail"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
          <input type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
          <input type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
          <p className="text-sm text-cyan-200 text-center">
            You already have an account?{' '}
            <a href="/login" className="underline text-cyan-300 hover:text-cyan-400">
              Log in here
            </a>
          </p>
          <button type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 rounded px-4 py-2 font-bold text-white transition">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
