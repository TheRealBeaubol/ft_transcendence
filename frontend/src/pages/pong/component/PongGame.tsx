import React, { useEffect, useRef, useState } from 'react';

export default function PongGame() {
	const canvasRef = useRef(null);
	const [leftScore, setLeftScore] = useState(0);
	const [rightScore, setRightScore] = useState(0);
	// const [keys, setKeys] = useState({});

	const paddleHeight = 80;
	const paddleWidth = 10;
	const canvasWidth = 600;
	const canvasHeight = 400;

	const leftPaddle = useRef({ x: 10, y: canvasHeight / 2 - paddleHeight / 2 });
	const rightPaddle = useRef({ x: canvasWidth - 20, y: canvasHeight / 2 - paddleHeight / 2 });
	const ball = useRef({ x: canvasWidth / 2, y: canvasHeight / 2, vx: 3, vy: 2 });
	const ballSpeedMultiplier = useRef(1); // 🔁 acceleration

	useEffect(() => {
		const keysPressed: Record<string, boolean> = {};

		const handleKeyDown = (e: KeyboardEvent) => { keysPressed[e.key] = true; };
		const handleKeyUp = (e: KeyboardEvent) => { keysPressed[e.key] = false; };

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const context = canvasRef.current!.getContext('2d')!;
		if (!context) return;
		let lastTime = performance.now();

		const baseSpeed = 200;
		// const speed = 200; // pixels per second
		const paddleSpeed = 300;

		const resetBall = (scoringPlayer: 'left' | 'right') => {
			if (scoringPlayer === 'left') setLeftScore((s) => s + 1);
			else setRightScore((s) => s + 1);

			ballSpeedMultiplier.current = 1

			ball.current = {
				x: canvasWidth / 2,
				y: canvasHeight / 2,
				vx: (Math.random() > 0.5 ? 1 : -1) * baseSpeed,
				vy: (Math.random() > 0.5 ? 1 : -1) * baseSpeed * 0.5,
			};
		};

		// Fonction utilitaire
		const calculateBounceAngle = (
		paddleY: number,
		ballY: number,
		paddleHeight: number,
		maxBounceAngle: number = Math.PI / 4 // 45°
		) => {
		const relativeIntersectY = (paddleY + paddleHeight / 2) - (ballY + 5); // balle centrée
		const normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
		return normalizedRelativeIntersectionY * maxBounceAngle;
		};

		const loop = (time: number) => {

			const delta = (time - lastTime) / 1000;
			lastTime = time;

			// Paddle movement
			if (keysPressed['w']) leftPaddle.current.y -= paddleSpeed * delta;
			if (keysPressed['s']) leftPaddle.current.y += paddleSpeed * delta;
			if (keysPressed['ArrowUp']) rightPaddle.current.y -= paddleSpeed * delta;
			if (keysPressed['ArrowDown']) rightPaddle.current.y += paddleSpeed * delta;

			// Clamp paddle position
			leftPaddle.current.y = Math.max(0, Math.min(canvasHeight - paddleHeight, leftPaddle.current.y));
			rightPaddle.current.y = Math.max(0, Math.min(canvasHeight - paddleHeight, rightPaddle.current.y));

			// Move ball
			ball.current.x += ball.current.vx * delta * ballSpeedMultiplier.current;
			ball.current.y += ball.current.vy * delta * ballSpeedMultiplier.current;

			// Bounce top/bottom
			if (ball.current.y <= 0 || ball.current.y >= canvasHeight - 10)
				ball.current.vy *= -1;

			// Left paddle collision
			if ( ball.current.x <= leftPaddle.current.x + paddleWidth && ball.current.y >= leftPaddle.current.y && ball.current.y <= leftPaddle.current.y + paddleHeight )
			{
				const angle = calculateBounceAngle(leftPaddle.current.y, ball.current.y, paddleHeight);
				const speed = baseSpeed * ballSpeedMultiplier.current;

				ball.current.vx = speed * Math.cos(angle);
				ball.current.vy = -speed * Math.sin(angle);
				ball.current.x = leftPaddle.current.x + paddleWidth;

				ballSpeedMultiplier.current += 0.3
			}

			// Right paddle collision
			if ( ball.current.x + 10 >= rightPaddle.current.x && ball.current.y >= rightPaddle.current.y && ball.current.y <= rightPaddle.current.y + paddleHeight)
			{
				const angle = calculateBounceAngle(rightPaddle.current.y, ball.current.y, paddleHeight);
				const speed = baseSpeed * ballSpeedMultiplier.current;

				ball.current.vx = -speed * Math.cos(angle);
				ball.current.vy = -speed * Math.sin(angle);
				ball.current.x = rightPaddle.current.x - 10;

				ballSpeedMultiplier.current += 0.3;
			}

			// Score if out
			if (ball.current.x < 0) resetBall('right');
			if (ball.current.x > canvasWidth) resetBall('left');

			// Draw
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			context.fillRect(ball.current.x, ball.current.y, 10, 10);
			context.fillRect(leftPaddle.current.x, leftPaddle.current.y, paddleWidth, paddleHeight);
			context.fillRect(rightPaddle.current.x, rightPaddle.current.y, paddleWidth, paddleHeight);

			requestAnimationFrame(loop);
		};

		resetBall(Math.random() > 0.5 ? 'left' : 'right'); // start random direction
		
		requestAnimationFrame(loop);

		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	
	}, []);

	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-black via-gray-900 to-black p-4">
			<h1 className="text-center text-3xl font-bold text-cyan-400 font-mono mb-6 drop-shadow-lg">
				Pong Game
			</h1>

			<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-3xl">
				<div className="bg-black bg-opacity-80 rounded-2xl px-8 py-6 text-white font-mono flex flex-col gap-6 items-center">
					
					<div className="flex justify-between w-full text-lg text-cyan-200">
						<span>Player 1: {leftScore}</span>
						<span>Player 2: {rightScore}</span>
					</div>

					<canvas
						ref={canvasRef}
						width={600}
						height={400}
						className="border border-cyan-400 rounded-xl shadow-md"
					/>
				</div>
			</div>
		</div>
	);

}
