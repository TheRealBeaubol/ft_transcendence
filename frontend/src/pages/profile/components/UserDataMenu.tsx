import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../UserContext';
import { Eye, EyeOff } from 'lucide-react';
import DeleteAccountBox from './DeleteAccountBox';

export default function UserDataMenu() {
	
	const navigate = useNavigate();
	const { user, setUser, refreshUser } = useUser();
	const [newAvatar, setNewAvatar] = useState('');
	const [oldPassword, setOldPassword] = useState('');

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

	return (
		<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
			<div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-4 items-center">
				{user.avatar && (<img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-cyan-300 mb-4"/>)}
				<input type="text" placeholder="Avatar URL"
					value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)}
					className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full mb-6"/>
				<div className="flex w-full gap-16 h-10">
					<button onClick={handleSaveAvatar} className="w-1/2 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition ">
						Save Avatar
					</button>
					<button onClick={handleResetAvatar} className="w-1/2 bg-red-600 hover:bg-red-700 rounded font-bold text-white transition">
						Reset Avatar
					</button>
				</div>
				<div className="text-lg text-cyan-200 text-left mt-6 w-full space-y-2">
					<div className="flex justify-between items-center">
						<span className="font-bold">
							Username:
						</span>
						<span className="text-cyan-100 truncate max-w-[200px] block">
							{user.username}
						</span>
					</div>
						<div className="flex justify-between items-center">
						<span className="font-bold">
							Email:
						</span>
						<span className="text-cyan-100 truncate max-w-[200px] block">
							{user.email}
						</span>
					</div>
				</div>
				<DeleteAccountBox onDeleteSuccess={handleDeleteSuccess} />
			</div>
		</div>
	)
}