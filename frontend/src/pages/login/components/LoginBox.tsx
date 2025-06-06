import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginBox() {
	
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identifier, password }),
			});
			const data = await res.json();
			if (!res.ok) {
			alert(data.error || 'Identifiants incorrects');
			return;
			}

			localStorage.setItem('jwt_token', data.token);
			const langRes = await fetch('/api/profile/language', {
			headers: {
				Authorization: `Bearer ${data.token}`,
			},
			});
			if (langRes.ok) {
			const langData = await langRes.json();
			if (langData.language) {
				i18n.changeLanguage(langData.language);
			}
			}

			navigate('/home');
		} catch (err) {
			console.error(err);
			alert('Impossible de contacter le serveur');
		}
	};


	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
				<form onSubmit={handleLogin} className="bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-6">
					<input type="text" placeholder={t('identifier_or_email')}
						value={identifier} onChange={(e) => setIdentifier(e.target.value)}
						className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
					<div className="relative">
						<input type={showPassword ? "text" : "password"} placeholder={t('password')}
							value={password} onChange={(e) => setPassword(e.target.value)}
							className="bg-white/10 border border-cyan-300 rounded px-4 py-2 text-white placeholder:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"/>
						<button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-2.5 text-cyan-300 hover:text-white">
							{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
						</button>
					</div>
					<p className="text-sm text-cyan-200 text-center">
						{t('no_account')}
						<a href="/register" className="underline text-cyan-300 hover:text-cyan-400">
							{t('register_here')}
						</a>
					</p>
					<button type="submit" className="bg-cyan-600 hover:bg-cyan-700 rounded px-4 py-2 font-bold text-white transition">
						{t('log_in')}
					</button>
				</form>
			</div>
		</div>
	);
}
