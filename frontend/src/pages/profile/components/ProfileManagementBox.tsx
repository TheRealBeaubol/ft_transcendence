import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../UserContext';
import { Eye, EyeOff } from 'lucide-react';
import UserDataMenu from './UserDataMenu';
import { useTranslation } from 'react-i18next';

interface User {
	id: number;
	username: string;
}

export default function ProfileManagementBox() {

	const navigate = useNavigate();
	const { user, setUser, refreshUser } = useUser();
	const [newEmail, setNewEmail] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [newUsername, setNewUsername] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { t } = useTranslation();

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

	if (!user) {
		return (
			<div className="fixed inset-0 flex items-center justify-center z-50">
				<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
					<div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-6">
						<span className="text-sm text-cyan-200 text-center">
							{t('please_log_in_to_manage_your_profile')}.
						</span>
						<button onClick={() => navigate('/login')} className="bg-cyan-600 hover:bg-cyan-700 rounded px-4 py-2 font-bold text-white transition">
							{t('log_in')}
						</button>
					</div>
				</div>
			</div>
		);
	}
	return (
	
	<div className="fixed inset-0 flex items-center justify-center z-50 gap-24">
		<UserDataMenu />
		<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
			<div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-4">
				<span className="text-2xl text-center mb-10">
					{t('edit_your_profile')}
				</span>
				<input type="email" placeholder={t('new_email')}
					value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
					className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-10"/>
				<input type="text" placeholder={t('new_username')} value={newUsername}
					onChange={(e) => setNewUsername(e.target.value)}
					className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-10"/>
				<div className="relative">
					<input type={showNewPassword ? "text" : "password"} placeholder={t('new_password')}
						value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
						className="bg-white/10 border border-cyan-300 rounded px-4 py-2 pr-10 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
					<button type="button" onClick={() => setShowNewPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
						{showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
					</button>
				</div>
				<div className="relative mb-10">
					<input type={showConfirmPassword ? "text" : "password"} placeholder={t('confirm_new_password')}
						value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
						className="bg-white/10 border border-cyan-300 rounded px-4 py-2 pr-10 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
					<button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
						{showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
					</button>
				</div>
				<div className="relative mb-12">
					<input type={showOldPassword ? "text" : "password"} placeholder={t('old_password_required')}
						value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
						className="bg-white/10 border border-cyan-300 rounded px-4 py-2 pr-10 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
					<button type="button" onClick={() => setShowOldPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
						{showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
					</button>
				</div>
				<div className="flex align-center justify-between gap-16">
					<button onClick={handleSaveChanges} className="w-1/2 h-10 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition ">
						{t('save_changes')}
					</button>
					<button onClick={handleLogout} className="w-1/2 bg-red-600 hover:bg-red-700 rounded font-bold text-white transition">
						{t('log_out')}
					</button>
				</div>
			</div>
		</div>
	</div>
	);
}
