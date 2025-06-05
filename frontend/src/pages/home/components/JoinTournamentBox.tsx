import React, { useState } from 'react';

export default function JoinTournamentBox() {
	const [tournamentName, setTournamentName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleJoinTournament = async () => {
		setError(null);
		setMessage(null);

		if (!tournamentName.trim()) {
			setError('Le nom du tournoi ne peut pas être vide');
			return;
		}

		setLoading(true);

		try {
			const res = await fetch('/api/tournaments/join', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
				},
				body: JSON.stringify({ tournamentName: tournamentName.trim() }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || 'Erreur inconnue');
			} else {
				setMessage(`Rejoint avec succès le tournoi "${tournamentName}"`);
				setTournamentName('');
			}
		} catch (err: any) {
			setError(err.message || 'Erreur inconnue');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-cyan-500 p-1 rounded-2xl max-w-md mx-auto">
			<div className="bg-black bg-opacity-80 rounded-2xl px-4 py-6 font-mono flex flex-col flex-grow overflow-hidden">
				<h2 className="text-white text-xl font-bold mb-4 text-center">Rejoindre un tournoi</h2>

				<input
					type="text"
					placeholder="Nom du tournoi"
					value={tournamentName}
					onChange={(e) => setTournamentName(e.target.value)}
					className="w-full p-3 rounded-2xl border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 mb-4"
				/>

				<button
					onClick={handleJoinTournament}
					disabled={loading}
					className={`w-full py-3 rounded-2xl font-bold ${loading ? 'bg-cyan-300 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
				>
					{loading ? 'Rejoint...' : 'Rejoindre'}
				</button>

				{error && <p className="mt-4 text-red-500 font-mono">{error}</p>}
				{message && <p className="mt-4 text-green-500 font-mono">{message}</p>}
			</div>
		</div>
	);
}
