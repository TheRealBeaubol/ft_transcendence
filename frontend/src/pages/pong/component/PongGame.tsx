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

	useEffect(() => {
		const keysPressed: Record<string, boolean> = {};

		const handleKeyDown = (e: KeyboardEvent) => { keysPressed[e.key] = true; };
		const handleKeyUp = (e: KeyboardEvent) => { keysPressed[e.key] = false; };

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const context = canvasRef.current!.getContext('2d')!;
		let lastTime = performance.now();

		const speed = 200; // pixels per second
		const paddleSpeed = 300;

		const resetBall = (scoringPlayer: 'left' | 'right') => {
			if (scoringPlayer === 'left') setLeftScore((s) => s + 1);
			else setRightScore((s) => s + 1);

			ball.current = {
				x: canvasWidth / 2,
				y: canvasHeight / 2,
				vx: (Math.random() > 0.5 ? 1 : -1) * speed,
				vy: (Math.random() > 0.5 ? 1 : -1) * speed * 0.5,
			};
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

			// Ball movement
			ball.current.x += ball.current.vx * delta;
			ball.current.y += ball.current.vy * delta;

			// Bounce top/bottom
			if (ball.current.y <= 0 || ball.current.y >= canvasHeight - 10)
				ball.current.vy *= -1;

			// Paddle collision
			if ( ball.current.x <= leftPaddle.current.x + paddleWidth && ball.current.y >= leftPaddle.current.y && ball.current.y <= leftPaddle.current.y + paddleHeight )
			{
				ball.current.vx *= -1;
				ball.current.x = leftPaddle.current.x + paddleWidth;
			}

			if ( ball.current.x + 10 >= rightPaddle.current.x && ball.current.y >= rightPaddle.current.y && ball.current.y <= rightPaddle.current.y + paddleHeight)
			{
				ball.current.vx *= -1;
				ball.current.x = rightPaddle.current.x - 10;
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

		// Initial ball velocity
		ball.current.vx = speed * (Math.random() > 0.5 ? 1 : -1);
		ball.current.vy = speed * 0.5 * (Math.random() > 0.5 ? 1 : -1);

		requestAnimationFrame(loop);

		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	}, []);

	return (
		<div>
			<h1 className="text-center text-xl font-bold">Pong</h1>
			<div className="flex justify-center my-2 text-lg font-mono">
				<span className="mx-4">Player 1: {leftScore}</span>
				<span className="mx-4">Player 2: {rightScore}</span>
			</div>
			<div className="flex justify-center mt-2">
				<canvas
					ref={canvasRef}
					width={600}
					height={400}
					style={{ border: '1px solid black' }}
				/>
			</div>
		</div>
	);
}
