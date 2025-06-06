import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface User {
	id: number;
	username: string;
}

export default function ProfileBox() {

	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
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
		navigate('/');
	};

	return (
		<div className="bg-cyan-500 p-1 rounded-bl-full">
			<div className="bg-black bg-opacity-80 rounded-bl-full px-6 py-2 flex justify-center gap-4 font-mono text-sm text-white">
				
				{!user ? (
				<div className="flex flex-col items-center">
					<button onClick={() => navigate('/login')} className="translate-x-3 px-6 py-5 cursor-pointer text-white font-bold underline text-base">
						{t('sign_in_or_log_in')}
					</button>
				</div>
				) : (

				<div className="relative px-4">
					<div className="flex gap-4">
						{user.avatar && (<img src={user.avatar} alt={t('avatar_alt')} className="w-20 h-20 rounded-full border-2 border-cyan-300"/>)}
						<div className="flex flex-col py-2">
							<span className="text-sm">
								{user.username}
							</span>
							<span onClick={() => navigate('/profile')} className="text-sm underline cursor-pointer">
								{t('edit_profile')}
							</span>
						</div>
					</div>
					<button onClick={handleLogout} className="absolute bottom-2 right-3 bg-red-600 hover:bg-red-700 rounded px-1 py-0.5 font-bold text-white transition">
						{t('log_out')}
					</button>
				</div>
				)}

		</div>
	</div>
	);
}