import React, { useEffect, useState } from 'react';

type Friend = {
	id: number;
	username: string;
	avatar?: string;
};

type FriendRequest = {
	id: number;
	requester: Friend;
	created_at: string;
};

export default function FriendList() {
	const [friends, setFriends] = useState<Friend[]>([]);
	const [requests, setRequests] = useState<FriendRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [friendUsername, setFriendUsername] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [showFriendRequests, setShowFriendRequests] = useState(false);
	const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true);
				const resFriends = await fetch('/api/friends', {
					headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
					credentials: 'include',
				});
				if (!resFriends.ok) throw new Error('Erreur lors du chargement des amis');
				const friendsData: Friend[] = await resFriends.json();
				setFriends(friendsData);

				const resRequests = await fetch('/api/friend-requests/received', {
					headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
					credentials: 'include',
				});
				if (!resRequests.ok) throw new Error('Erreur lors du chargement des demandes');
				const requestsData: FriendRequest[] = await resRequests.json();
				setRequests(requestsData);

			} catch (err: any) {
				setError(err.message || 'Erreur inconnue');
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const handleAddFriend = async () => {
		try {
			setMessage(null);
			setError(null);
			const response = await fetch('/api/friend-requests/send', {
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
			setMessage(`Demande envoyée à ${friendUsername} avec succès.`);
			setFriendUsername('');
		} catch (err: any) {
			setError(err.message || 'Erreur inconnue');
		}
	};

	const handleRespondRequest = async (requestId: number, accept: boolean) => {
		try {
			const response = await fetch('/api/friend-requests/respond', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
				},
				body: JSON.stringify({ requestId, accept }),
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.error || 'Erreur inconnue');
				return;
			}
			setMessage(accept ? 'Demande acceptée' : 'Demande refusée');

			setRequests(requests.filter(r => r.id !== requestId));
			if (accept && data.friend) {
				setFriends(prev => [...prev, data.friend]);
			}
		} catch (err: any) {
			setError(err.message || 'Erreur inconnue');
		}
	};

	const handleRemoveFriend = async (friendId: number) => {
		try {
			const response = await fetch(`/api/friends/remove/${friendId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
				},
			});

			const data = await response.json();
			if (!response.ok) {
				setError(data.error || 'Erreur inconnue');
				return;
			}

			setFriends(friends.filter(friend => friend.id !== friendId));
			setMessage('Ami supprimé avec succès');
		} catch (err: any) {
			setError(err.message || 'Erreur inconnue');
		}
	};

	if (loading) return <p>Chargement...</p>;
	if (error) return <p className="text-red-500">{error}</p>;

	return (
		<div className="bg-cyan-500 p-1 rounded-2xl flex-1 m-5 max-h-[90vh] flex flex-col">
			<div className="bg-black bg-opacity-80 rounded-2xl px-4 py-6 text-white font-mono flex flex-col flex-grow overflow-hidden">
				<div className="flex flex-col flex-grow overflow-auto pr-1">
					<h2 className="text-xl font-bold mb-4 flex justify-center">Friends list</h2>
					{friends.length === 0 ? (
						<p>You don't have any friends yet.</p>
					) : (
						<ul>
							{friends.map((friend) => (
							<li key={friend.id} className="flex items-center justify-between mb-2 max-w-full">
								<div className="flex items-center gap-3 max-w-[calc(100%-40px)]">
									<img src={friend.avatar} alt={friend.username} className="w-8 h-8 rounded-full flex-shrink-0" />
									<span className="truncate">
										{friend.username}
									</span>
								</div>
									<button onClick={() => { setFriendToDelete(friend); setShowModal(true);}} className="bg-red-500 text-white px-3 py-1 rounded flex-shrink-0 ml-3">
										×
									</button>
							</li>
							))}
						</ul>
					)}
				</div>
				<div className="mt-4 w-full max-w-md mx-auto font-mono flex flex-col gap-4" style={{flexShrink: 0}}>
					<input type="text" value={friendUsername}
						onChange={(e) => setFriendUsername(e.target.value)} placeholder="Enter username"
						className="w-full p-3 rounded-2xl border border-cyan-500 bg-black bg-opacity-60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[40px]"/>
					<button onClick={handleAddFriend} className="w-full bg-cyan-500 text-black font-bold px-4 py-3 rounded-2xl hover:bg-cyan-400 transition-shadow shadow-md hover:shadow-lg min-h-[40px]">
						Send Friend Request
					</button>
					<button onClick={() => { setShowFriendRequests(true); setShowModal(true);}} className="w-full bg-cyan-500 text-black font-bold px-4 py-2 rounded-2xl hover:bg-cyan-400 transition-shadow shadow-md hover:shadow-lg min-h-[40px] relative">
						Friend Requests
						{requests.length > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
							{requests.length > 9 ? '9+' : requests.length}
						</span>
						)}
					</button>
				</div>
				{showModal && friendToDelete && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-cyan-500 p-1 rounded-2xl">
							<div className="bg-black bg-opacity-90 rounded-2xl px-6 py-8 text-white font-mono flex flex-col w-[400px]">
								<h3 className="text-xl font-bold text-center mb-4">Confirm Deletion</h3>
								<p className="text-center mb-6">
									Are you sure you want to remove{' '}
									<span className="font-bold text-lg text-blue-500">
										{friendToDelete.username}
									</span>
									{' '}from your friends list?
								</p>
								<div className="flex justify-between mt-4">
									<button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-500 rounded hover:bg-gray-400 mr-2">
										Cancel
									</button>
									<button onClick={() => { handleRemoveFriend(friendToDelete.id); setShowModal(false);}} className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2">
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
				{showModal && showFriendRequests && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-cyan-500 p-1 rounded-2xl">
							<div className="bg-black bg-opacity-90 rounded-2xl px-6 py-8 text-white font-mono flex flex-col w-[400px] max-h-[80vh] overflow-auto">
								<h3 className="text-xl font-bold text-center mb-4">Friend Requests</h3>
								{requests.length === 0 ? (
								<p className="text-center text-gray-400">No new friend requests.</p>
								) : (
								<ul className="space-y-3">
									{requests.map((req) => (
									<li key={req.id} className="flex justify-between items-center">
										<span>
											{req.requester.username}
										</span>
										<div className="flex gap-2">
										<button onClick={() => handleRespondRequest(req.id, true)} className="bg-green-500 px-3 py-1 rounded hover:bg-green-400">
											Accept
										</button>
										<button onClick={() => handleRespondRequest(req.id, false)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-400">
											Decline
										</button>
										</div>
									</li>
									))}
								</ul>
								)}
								<button onClick={() => { setShowFriendRequests(false); setShowModal(false);}} className="mt-6 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">
									Close
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}