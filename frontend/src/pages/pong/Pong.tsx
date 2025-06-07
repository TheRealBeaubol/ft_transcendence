import React, { useEffect, useRef } from 'react';
import { initParticles } from '../utils/particles';
import PongGame from './component/PongGame';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Pong() {
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
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
			<PongGame />;
			<button onClick={() => navigate('/home')} className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 z-20">
				← {t('back_to_home')}
			</button>
		</div>
	)
}

export default Pong;