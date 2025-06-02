import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    username: string;
  }

export default function ProfileManagementBox() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  
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

    const handleSaveChanges = async () => {
  if (!oldPassword) {
    alert('Veuillez entrer votre mot de passe actuel.');
    return;
  }

  if (newPassword) {
    if (newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
  }

  if (!newUsername && !newPassword) {
    alert('Aucune modification détectée.');
    return;
  }

  const token = localStorage.getItem('jwt_token');
  if (!token) {
    alert('Vous n’êtes pas authentifié.');
    return;
  }

  const body = {
    oldPassword,
    ...(newUsername && { newUsername }),
    ...(newPassword && { newPassword }),
  };

  try {
    console.log('Envoi vers /api/profile avec :', body);
    console.log('Token utilisé :', token);
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Erreur lors de la mise à jour');
      return;
    }

    alert('Modifications enregistrées.');
    if (newUsername) {
      setUser(prev => prev ? { ...prev, username: newUsername } : null);
    }

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewUsername('');

  } catch (err) {
    console.error(err);
    alert('Erreur réseau ou serveur.');
  }
};

  if (!user) {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-6">
                <span className="text-sm text-cyan-200 text-center">
                    Please log in to manage your profile.
                </span>
                <button onClick={() => navigate('/login')} className="bg-cyan-600 hover:bg-cyan-700 rounded px-4 py-2 font-bold text-white transition">
                    Log in
                </button>
            </div>
        </div>
    </div>
    );
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-6">
                <span className="text-2xl text-center">
                    Welcome <span className="text-cyan-400 font-bold">{user.username}</span>
                </span>
                <input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                <input type="text" placeholder="New Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                <div className="flex align-center justify-between">

                    <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 rounded px-4 py-2 font-bold text-white transition">
                        Save Changes
                    </button>
                    <button onClick={handleLogout} className="bg-cyan-600 hover:bg-cyan-700 rounded px-4 py-2 font-bold text-white transition">
                        Log out
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
