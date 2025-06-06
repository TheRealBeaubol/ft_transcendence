import React, { useEffect, useRef } from 'react';
import { initParticles } from '../utils/particles';
import PongGame from './component/PongGame';

function Pong() {
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
			<PongGame />;
		</div>
	)
}

export default Pong;