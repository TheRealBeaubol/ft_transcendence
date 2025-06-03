import React, { useEffect, useState } from 'react';

type Friend = {
	id: number;
	username: string;
	avatar?: string;
};

export default function FriendList() {
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [friendUsername, setFriendUsername] = useState('');
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		async function fetchFriends() {
			try {
				const response = await fetch('/api/friends', {
					method: 'GET',
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
					},
				});
				if (!response.ok) throw new Error('Échec du chargement des amis');
				const data: Friend[] = await response.json();
				setFriends(data);
			} catch (err: any) {
				setError(err.message || 'Erreur inconnue');
			} finally {
				setLoading(false);
			}
		}
		fetchFriends();
	}, []);

	const handleAddFriend = async () => {
		try {
			setMessage(null);
			const response = await fetch('/api/friends/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
				},
				body: JSON.stringify({ friendUsername }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || 'Erreur inconnue');
				return;
			}

			setFriends([...friends, data.friend]);
			setFriendUsername('');
			setMessage(`Ami ${data.friend.username} ajouté avec succès`);
		} catch (err: any) {
			setError(err.message || 'Erreur inconnue');
		}
	};

	
	if (loading) return <p>Chargement des amis...</p>;
	if (error) return <p className="text-red-500">{error}</p>;
  
	return (
		<div className="bg-cyan-500 p-1 rounded-2xl flex-1 overflow-auto m-5">
			<div className="bg-black bg-opacity-80 rounded-2xl px-4 py-6 text-white font-mono flex flex-col gap-4 h-full">
				<h2 className="text-xl font-bold">
					Liste d'amis
				</h2>
				{friends.length === 0 ? (
				<p>Tu n'as aucun ami pour le moment.</p>
				) : (
				<ul>
					{friends.map((friend) => (
					<li key={friend.id} className="flex items-center gap-3 mb-3">
							{friend.avatar ? (
						<img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full"/>
						) : (
						<div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white">
							{friend.username[0].toUpperCase()}
						</div>
						)}
						<span>
							{friend.username}
						</span>
					</li>
					))}
				</ul>
				)}
				<input type="text" value={friendUsername}
					onChange={(e) => setFriendUsername(e.target.value)} placeholder="Nom d'utilisateur de l'ami"
					className="w-full p-2 mb-2 text-black rounded"/>
				<button onClick={handleAddFriend} className="bg-white text-cyan-500 px-4 py-2 rounded font-bold w-full hover:bg-gray-100">
					Ajouter un ami
				</button>

				{message && <p className="text-green-200 mt-2">{message}</p>}
			</div>
		</div>
	);
}