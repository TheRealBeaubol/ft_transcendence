import React, { useEffect, useRef } from 'react';
import ProfileBox from './components/ProfileBox';
import FriendBox from './components/FriendBox';
import { initParticles } from '../utils/particles';
import './index.css';

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
			<div className="fixed top-0 right-0 h-screen w-72 flex flex-col justify-between z-10">
				<ProfileBox />
				<FriendBox />
			</div>
		</div>
	);
};

export default Home;
