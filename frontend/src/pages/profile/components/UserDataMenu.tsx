import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../UserContext';
import DeleteAccountBox from './DeleteAccountBox';
import { useTranslation } from 'react-i18next';

export default function UserDataMenu() {
	
	const navigate = useNavigate();
	const { user, setUser, refreshUser } = useUser();
	const [newAvatar, setNewAvatar] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const { t, i18n } = useTranslation();
	
	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		i18n.changeLanguage(e.target.value);
	};

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
		async function fetchUserLanguage() {
			try {
				const res = await fetch('/api/profile/language', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				if (!res.ok) throw new Error('Failed to fetch language');
				const data = await res.json();
				if (data.language) {
					i18n.changeLanguage(data.language);
				}
			} catch (err) {
				console.error(err);
			}
		}
		fetchUserLanguage();
	}, [i18n, setUser]);

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

	const handleLanguageSave = async () => {
	try {
		const token = localStorage.getItem('jwt_token');
		if (!token) {
		alert("Not authenticated");
		return;
		}

		const res = await fetch('/api/profile/language', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ language: i18n.language }),
		});

		if (!res.ok) {
		// Essaie de récupérer le message d'erreur backend
		const errorData = await res.json().catch(() => null);
		throw new Error('Failed to save language');
		}

		alert("Language saved successfully");
	} catch (error) {
		console.error(error);
		alert("Failed to save language");
	}
	};

	return (
		<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
			<div className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-4 items-center">
				{user.avatar && (<img src={user.avatar} alt={t('avatar_alt')} className="w-24 h-24 rounded-full border-2 border-cyan-300 mb-4"/>)}
				<input type="text" placeholder={t('new_avatar_url')}
					value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)}
					className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full mb-6"/>
				<div className="flex w-full gap-16 h-10">
					<button onClick={handleSaveAvatar} className="w-1/2 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition ">
						{t('save_avatar')}
					</button>
					<button onClick={handleResetAvatar} className="w-1/2 bg-red-600 hover:bg-red-700 rounded font-bold text-white transition">
						{t('reset_avatar')}
					</button>
				</div>
				<div className="text-lg text-cyan-200 text-left mt-6 w-full space-y-2">
					<div className="flex justify-between items-center">
						<span className="font-bold">
							{t('username')}:
						</span>
						<span className="text-cyan-100 truncate max-w-[200px] block">
							{user.username}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="font-bold">
							{t('email')}:
						</span>
						<span className="text-cyan-100 truncate max-w-[200px] block">
							{user.email}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="font-bold">
							{t('language')}:
						</span>
						<select value={i18n.language} onChange={handleLanguageChange} className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400">
							<option value="en">English</option>
							<option value="fr">Français</option>
						</select>
						<button onClick={handleLanguageSave} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
							{t('save_changes')}
						</button>
					</div>
				</div>
				<DeleteAccountBox onDeleteSuccess={handleDeleteSuccess} />
			</div>
		</div>
	);
}