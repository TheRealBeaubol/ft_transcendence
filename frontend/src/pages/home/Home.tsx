import React, { useEffect, useRef, useState } from 'react';
import ProfileBox from './components/ProfileBox';
import FriendBox from './components/FriendBox';
import TournamentBox from './components/TournamentBox';
import { initParticles } from '../utils/particles';
import './index.css';

const Home: React.FC = () => {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	 
	useEffect(() => {
		console.log('In useEffect');
		const canvas = canvasRef.current;
		if (!canvas) return;
		const cleanup = initParticles(canvas);
		return cleanup;
	}, []);

	return (
		<div className="bg-gray-950 relative w-full h-screen overflow-hidden">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
			<div className="fixed top-0 right-0 h-screen w-72 flex flex-col justify-between z-10">
				<ProfileBox />
				<FriendBox />
				<TournamentBox />
			</div>
		</div>
	);
};

export default Home;
