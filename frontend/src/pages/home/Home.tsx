import React, { useEffect, useRef } from 'react';
import ProfileBox from './components/ProfileBox';
import FriendBox from './components/FriendBox';
import { initParticles } from '../utils/particles';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Home: React.FC = () => {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const navigate = useNavigate();
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const cleanup = initParticles(canvas);
		const token = localStorage.getItem('jwt_token');
		if (!token) {
			navigate('/');
		}
		return cleanup;
	}, []);

	return (
		<div className="bg-gray-950 relative w-full h-screen overflow-hidden">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"/>
			<div className="fixed left-1/2 transform -translate-x-1/2 -translate-y-[90%] hover:translate-y-0 transition-transform duration-700 ease-in-out w-fit z-10">
				<ProfileBox />
			</div>
			<div className="fixed right-0 top-0 h-screen flex z-10">
				<FriendBox />
			</div>
		</div>
	);
};

export default Home;
