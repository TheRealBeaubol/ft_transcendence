import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
}

export default function ProfileBox() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem('jwt_token');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data as User);
        }
      })
      .catch(() => {
        localStorage.removeItem('jwt_token');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="fixed right-0 w-72 bg-cyan-500 p-1 rounded-bl-full z-11">
        <div className="bg-black bg-opacity-80 rounded-bl-full px-6 py-2 flex justify-center gap-4 font-mono text-sm text-white">
          <div className="flex flex-col items-center">
            <button onClick={() => navigate('/login')} className="translate-x-3 px-6 py-5 cursor-pointer text-white font-bold underline text-base">
              Sign-in or Log-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="fixed right-0 w-72 bg-cyan-500 p-1 rounded-bl-full">
        <div className="relative bg-black bg-opacity-80 rounded-bl-full px-6 py-2 font-mono text-sm text-white pb-3">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-full border-2 border-white bg-black"></div>
            <div className="flex flex-col">
              <span className="text-sm">{user.username}</span>
              <span onClick={() => navigate('/profile')} className="text-sm underline cursor-pointer">
                Edit Profile
              </span>
            </div>
              <button onClick={handleLogout}
                className="absolute bottom-2 right-3 bg-red-600 hover:bg-red-700 rounded px-1 py-0.5 font-bold text-white transition">
                 Log-out
              </button>
          </div>
        </div>
      </div>

  );
}