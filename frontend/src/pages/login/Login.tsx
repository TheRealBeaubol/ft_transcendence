import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { initParticles } from '../utils/particles';
import LoginBox from './components/LoginBox';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {

	const navigate = useNavigate();
	const { t } = useTranslation();

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const cleanup = initParticles(canvas);
		const token = localStorage.getItem('jwt_token');
		if (token) {
			navigate('/home');
		}
		return cleanup;
	}, []);

	return (

		<div className="bg-gray-950 relative w-full h-screen overflow-hidden">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
				<button onClick={() => navigate('/')} className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 z-20">
					← {t('back_to_home')}
				</button>
				<div className="min-h-screen flex flex-col items-center justify-center space-y-4 z-10 relative">
					<LoginBox />
				</div>
		</div>
	);
};

export default Login;
