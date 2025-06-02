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

    // Appel pour récupérer le profil utilisateur
    fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          // Si le token est invalide ou expiré, on le supprime
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
        // En cas d’erreur réseau, on efface aussi
        localStorage.removeItem('jwt_token');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    navigate('/login');
  };

  // Si pas d’utilisateur connecté, on affiche le bouton Sign-in/Log-in
  if (!user) {
    return (
      <div className="fixed right-0 w-72 bg-cyan-500 p-1 rounded-bl-full">
        <div className="bg-black bg-opacity-80 rounded-bl-full px-6 py-2 flex justify-center gap-4 font-mono text-sm text-white">
          <div className="flex flex-col items-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-5 text-white font-bold underline text-base"
            >
              Sign-in or Log-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si l’utilisateur est connecté, afficher son nom + bouton de logout
  return (
    <div className="fixed right-0 w-72 bg-cyan-500 p-1 rounded-bl-full">
      <div className="bg-black bg-opacity-80 rounded-bl-full px-6 py-2 flex justify-center gap-4 font-mono text-sm text-white">
        <div className="flex flex-col justify-center items-center">
          <span className="text-sm">{user.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm underline cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}