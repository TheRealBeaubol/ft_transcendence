import React, { useEffect, useRef } from 'react';
import ProfileBox from './components/ProfileBox';
import FriendBox from './components/FriendBox';
import { initParticles } from '../utils/particles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.css';

const Home: React.FC = () => {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { t } = useTranslation();
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
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex gap-12 flex-wrap justify-center items-center">
				<button	onClick={() => navigate('/pong')} className="bg-cyan-500 p-1 rounded-2xl w-[280px] h-[180px] flex items-center justify-center  transform transition duration-700 ease-in-out hover:-translate-y-1 hover:scale-110  shadow-[0_0_15px_3px_rgba(34,211,238,0.7)]  hover:shadow-[0_0_30px_6px_rgba(34,211,238,1)]">
					<div className="bg-black bg-opacity-80 rounded-2xl w-full h-full flex items-center justify-center overflow-hidden">
						<span className="text-[2rem] sm:text-[2.5rem] font-extrabold uppercase tracking-widest font-['Orbitron'] text-transparent bg-clip-text bg-cyan-500 text-center w-full px-2">
							Pong
						</span>
					</div>
				</button>
				<button	onClick={() => navigate('/home')} className="bg-cyan-500 p-1 rounded-2xl w-[280px] h-[180px] flex items-center justify-center  transform transition duration-700 ease-in-out hover:-translate-y-1 hover:scale-110  shadow-[0_0_15px_3px_rgba(34,211,238,0.7)]  hover:shadow-[0_0_30px_6px_rgba(34,211,238,1)]">
					<div className="bg-black bg-opacity-80 rounded-2xl w-full h-full flex items-center justify-center overflow-hidden">
						<span className="text-[2rem] sm:text-[2.5rem] font-extrabold uppercase tracking-widest font-['Orbitron'] text-transparent bg-clip-text bg-cyan-500 text-center w-full px-2">
							Tournament
						</span>
					</div>
				</button>
			</div>
		</div>
	);
};

export default Home;
