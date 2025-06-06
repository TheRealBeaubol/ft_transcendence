import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, UserRoundCog } from 'lucide-react';

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
		<div className="bg-cyan-500 p-1 rounded-b-custom">
			<div className="bg-black bg-opacity-80 rounded-b-custom px-16 py-2 font-mono text-sm text-white">	
			{!user ? (
				<div className="flex items-center">
					<button onClick={() => navigate('/login')} className="px-6 py-3 text-base font-bold text-white underline transition hover:opacity-90">
					{t('sign_in_or_log_in')}
					</button>
				</div>
			) : (
				<div className="flex items-center gap-2 text-center">
					{user.avatar && (<img src={user.avatar} alt={t('avatar_alt')} className="w-24 h-24 rounded-full border-2 mr-8 border-cyan-300 object-cover"/>)}
					<div className="flex items-center flex-col gap-4">
						<span className="text-base font-semibold break-words max-w-[10rem]">
							{user.username}
						</span>
						<div className="flex gap-4">
							<button onClick={() => navigate('/profile')} className="bg-gray-600 hover:bg-gray-700 rounded px-3 py-2 transition">
								<UserRoundCog size={20} />
							</button>
							<button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 rounded px-3 py-2 transition">
								<LogOut size={20} />
							</button>
						</div>
					</div>
				</div>
				)}
			</div>
		</div>
	);
}