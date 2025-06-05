import React, { useEffect, useRef } from 'react';
import ProfileBox from './components/ProfileBox';
import FriendBox from './components/FriendBox';
import CreateTournamentBox from './components/CreateTournamentBox';
import JoinTournamentBox from './components/JoinTournamentBox';
import TournamentBracket from './components/TournamentBracket';
import { initParticles } from '../utils/particles';
import './index.css';

const samplePlayers = [
  { id: 1, username: 'Alice', avatar: '/avatars/alice.png' },
  { id: 2, username: 'Bob', avatar: '/avatars/bob.png' },
  { id: 3, username: 'Charlie', avatar: '/avatars/charlie.png' },
  { id: 4, username: 'David', avatar: '/avatars/david.png' },
  { id: 5, username: 'Eve', avatar: '/avatars/eve.png' },
  { id: 6, username: 'Frank', avatar: '/avatars/frank.png' },
  { id: 7, username: 'Grace', avatar: '/avatars/grace.png' },
  { id: 8, username: 'Hugo', avatar: '/avatars/hugo.png' },
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
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const cleanup = initParticles(canvas);
		return cleanup;
	}, []);

	return (
		<div className="bg-gray-950 relative w-full h-screen overflow-hidden">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
			 <div className="flex-grow overflow-auto p-6">
        		<TournamentBracket matches={sampleMatches} />
      		</div>
			<div className="fixed top-0 right-0 h-screen w-72 flex flex-col justify-between z-10">
				<ProfileBox />
				<FriendBox />
				<CreateTournamentBox />
				<JoinTournamentBox />
			</div>
		</div>
	);
};

export default Home;
