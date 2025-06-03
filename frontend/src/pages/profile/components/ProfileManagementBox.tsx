import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../UserContext';
import { Eye, EyeOff } from 'lucide-react';
import DeleteAccountBox from './DeleteAccountBox';

interface User {
    id: number;
    username: string;
  }

export default function ProfileManagementBox() {
    const navigate = useNavigate();

    const { user, setUser, refreshUser } = useUser();

    const [newEmail, setNewEmail] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  navigate('/profile');
};

const handleSaveChanges = async () => {
  if (!oldPassword) {
    alert('Veuillez entrer votre mot de passe actuel.');
    return;
  }
  if (newEmail && !/^\S+@\S+\.\S+$/.test(newEmail)) {
    alert('Veuillez entrer une adresse email valide.');
    return;
  }
  if (newUsername && (newUsername.length < 3 || newUsername.length > 16)) {
    alert('Le nouveau nom d’utilisateur doit contenir entre 3 et 16 caractères.');
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
  if (!newUsername && !newPassword && !newEmail) {
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
    ...(newEmail && { newEmail }),
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
    await refreshUser();

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewUsername('');
    setNewEmail('');
  } catch (err) {
    console.error(err);
    alert('Erreur réseau ou serveur.');
  }
};

const handleSaveAvatar = async () => {
  const token = localStorage.getItem('jwt_token');
  if (!token) return alert('Non authentifié');

  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newAvatar }) // n'oublie pas oldPassword !
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error || 'Erreur');

  setUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
  setNewAvatar('');
};

const handleResetAvatar = () => {
  const DEFAULT_AVATAR = "https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg";
  setNewAvatar(DEFAULT_AVATAR);
};

const handleDeleteSuccess = () => {
  localStorage.removeItem('jwt_token');
  setUser(null);
  navigate('/login');
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
    
    <div className="fixed inset-0 flex items-center justify-center z-50 gap-24">
      <div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-4 items-center">
          {user.avatar && (<img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-cyan-300 mb-4"/>)}
          <input type="text" placeholder="Avatar URL" value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full mb-6"/>
          <div className="flex w-full gap-16">
            <button onClick={handleSaveAvatar} className="w-1/2 h-10 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition ">
              Save Avatar
            </button>
            <button onClick={handleResetAvatar} className="w-1/2 bg-red-600 hover:bg-red-700 rounded font-bold text-white transition">
              Reset Avatar
            </button>
          </div>
          <div className="text-lg text-cyan-200 text-left mt-6 w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">Username:</span>
              <span className="text-cyan-100 truncate max-w-[200px] block">{user.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Email:</span>
              <span className="text-cyan-100 truncate max-w-[200px] block">{user.email}</span>
            </div>
          </div>
            <DeleteAccountBox onDeleteSuccess={handleDeleteSuccess} />
        </div>
      </div>
      <div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-4">
          <span className="text-2xl text-center mb-10">
            Edit your profile
          </span>
          <input type="email" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-10"/>
          <input type="text" placeholder="New Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-10"/>
          <div className="relative">
            <input type={showNewPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 pr-10 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
            <button type="button" onClick={() => setShowNewPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
              {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <div className="relative mb-10">
            <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 pr-10 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
            <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <div className="relative mb-12">
            <input type={showOldPassword ? "text" : "password"} placeholder="Old Password (Required)" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 pr-10 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
            <button type="button" onClick={() => setShowOldPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
              {showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <div className="flex align-center justify-between gap-16">
            <button onClick={handleSaveChanges} className="w-1/2 h-10 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition ">
              Save Changes
            </button>
            <button onClick={handleLogout} className="w-1/2 bg-red-600 hover:bg-red-700 rounded font-bold text-white transition">
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
