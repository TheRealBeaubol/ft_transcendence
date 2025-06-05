import React, { useEffect, useRef, useState } from 'react';
import ProfileBox from './components/ProfileBox';
import FriendBox from './components/FriendBox';
import CreateTournamentBox from './components/CreateTournamentBox';
import JoinTournamentBox from './components/JoinTournamentBox';
import TournamentBracket from './components/TournamentBracket';
import { initParticles } from '../utils/particles';
import './index.css';

const samplePlayers = [
  { id: 1, username: 'Alice', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 2, username: 'Bob', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 3, username: 'Charlie', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 4, username: 'David', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 5, username: 'Eve', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 6, username: 'Frank', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 7, username: 'Grace', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
  { id: 8, username: 'Hugo', avatar: 'https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg' },
];

const sampleMatches = [
  // Quarts
  { id: 1, round: 1, player1: samplePlayers[0], player2: samplePlayers[1] },
  { id: 2, round: 1, player1: samplePlayers[2], player2: samplePlayers[3] },
  { id: 3, round: 1, player1: samplePlayers[4], player2: samplePlayers[5] },
  { id: 4, round: 1, player1: samplePlayers[6], player2: samplePlayers[7] },
  // Demis (encore vides)
  { id: 5, round: 2, player1: null, player2: null },
  { id: 6, round: 2, player1: null, player2: null },
  // Finale (encore vide)
  { id: 7, round: 3, player1: null, player2: null },
];

const Home: React.FC = () => {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	 
	useEffect(() => {
		console.log('In useEffect');
		const canvas = canvasRef.current;
		if (!canvas) return;
		const cleanup = initParticles(canvas);

		// Vérifie si un token est présent (tu peux améliorer avec un appel backend si besoin)
    	const token = localStorage.getItem('jwt_token');
		console.log('Token présent ?', token);
    	setIsAuthenticated(!!token);

		return cleanup;
	}, []);

	return (
		<div className="bg-gray-950 relative w-full h-screen overflow-hidden">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
			 <div className="flex-grow overflow-auto p-6">
				{isAuthenticated && (
					<>
						<TournamentBracket matches={sampleMatches} />
					</>
				)}
      		</div>
			<div className="fixed top-0 right-0 h-screen w-72 flex flex-col justify-between z-10">
				<ProfileBox />
				<FriendBox />
				{isAuthenticated && (
					<>
						<CreateTournamentBox />
						<JoinTournamentBox />
					</>
				)}
			</div>
		</div>
	);
};

export default Home;
