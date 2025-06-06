import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../UserContext';
import { useTranslation } from 'react-i18next';

interface DeleteAccountBoxProps {
	onDeleteSuccess: () => void;
}

export default function DeleteAccountBox({ onDeleteSuccess }: DeleteAccountBoxProps) {

	const [showModal, setShowModal] = useState(false);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [countdown, setCountdown] = useState(5);
	const [error, setError] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { user, setUser } = useUser();
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (showModal && countdown > 0) {
			timer = setTimeout(() => setCountdown(countdown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [countdown, showModal]);

	const handleDelete = async () => {
		setError('');

		if (!password || !confirmPassword) {
			setError('Please fill both password fields.');
			return;
		}
	
		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}
	
		setIsDeleting(true);
	
		const token = localStorage.getItem('jwt_token');
		if (!token) {
			setError('User not authenticated.');
			setIsDeleting(false);
			return;
		}
	
		try {
			const res = await fetch('/api/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ password }),
			});
		
			const data = await res.json();
		
			if (!res.ok) {
				setError(data.error || 'Failed to delete account.');
				setIsDeleting(false);
				return;
			}
		
			alert('Your account has been deleted.');
			setShowModal(false);
			setIsDeleting(false);
			localStorage.removeItem('jwt_token');
			setUser(null);
			navigate('/');
		} catch (err) {
			setError('Network or server error.');
			setIsDeleting(false);
		}
	};
	

	return (
		<>
			<button onClick={() => { setShowModal(true); setCountdown(5); setPassword(''); setConfirmPassword(''); setError(''); }} className="mt-6 w-full bg-red-600 hover:bg-red-700 rounded font-bold text-white py-2 transition">
				{t('delete_account')}
			</button>

			{showModal && (
			<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
				<div className="bg-red-500 p-1 rounded-2xl shadow-2xl w-full max-w-md">
					<div className="relative bg-black bg-opacity-80 rounded-2xl px-8 py-10 text-white font-mono flex flex-col gap-4 items-center">
						<button onClick={() => setShowModal(false)} className="absolute top-3 right-5 text-red-500 hover:text-red-700 font-bold" aria-label="Close modal">
							×
						</button>
						<h2 className="text-2xl font-bold text-red-500 text-center mb-4">{t('confirm_account_deletion')}</h2>
						<div className="relative">
							<input type={showPassword ? "text" : "password"} placeholder={t('password')}
								value={password} onChange={(e) => setPassword(e.target.value)}
								className="bg-white/10 border border-red-500 rounded px-4 py-2 text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-400"/>
							<button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-2.5 text-red-300 hover:text-white">
								{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
							</button>
						</div>
						<div className="relative">
							<input type={showConfirmPassword ? "text" : "password"} placeholder={t('confirm_password')}
								value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
								className="bg-white/10 border border-red-500 rounded px-4 py-2 text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 mb-5"/>
							<button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-3 top-2.5 text-red-300 hover:text-white">
								{showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
							</button>
						</div>
						{error && <p className="text-red-400 text-center">{error}</p>}

						{countdown > 0 ? (
							<p className="text-center text-red-400">
								{t('you_can_delete_your_account_in')}{countdown} {t('second')}{countdown > 1 ? 's' : ''}...
							</p>
						
						) : (
						
						<button onClick={handleDelete} disabled={isDeleting} className={`w-full py-2 rounded font-bold transition ${isDeleting ? 'bg-red-900 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}>
								{isDeleting ? t('deleting') : t('delete_account')}
						</button>
						)}

					</div>
				</div>
			</div>
			)}
		</>
	);
}
