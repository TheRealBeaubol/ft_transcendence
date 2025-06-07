import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
	id: number;
	username: string;
}

export default function TournamentButton() {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	

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
			if (data) setUser(data as User);
		})
		.catch(() => {
			localStorage.removeItem('jwt_token');
		});

		setIsAuthenticated(!!token);

	}, []);

	if (!user) return null;

	return (
		<div className="fixed top-4 left-4 z-20">
			{isAuthenticated && (
				<>
					<button onClick={() => navigate('/tournament')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded shadow" >
						Tournament
					</button>
				</>
			)}
		</div>
	);
}
