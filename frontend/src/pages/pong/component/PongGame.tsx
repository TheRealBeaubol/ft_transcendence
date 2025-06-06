import React, { useEffect, useRef, useState } from 'react';

export default function PongGame() {

	const colorMap = {
		cyan: '0, 255, 255',
		magenta: '255, 0, 255',
		white: '255, 255, 255',
	};

	function hexToRgb(colorName) {
		return colorMap[colorName] || '255, 255, 255';
	}

	const gameStartTime = useRef(performance.now()); // pour suivre la durée de la partie

	const canvasRef = useRef(null);
	const canvasWidth = 600;
	const canvasHeight = 400;

	const particles = useRef([]); // tableau des particule

	const [leftScore, setLeftScore] = useState(0);
	const [rightScore, setRightScore] = useState(0);

	const leftScoreRef = useRef(0);
	const rightScoreRef = useRef(0);

	const ball = useRef({ x: canvasWidth / 2, y: canvasHeight / 2, vx: 3, vy: 2 });
	const ballSpeedMultiplier = useRef(1); // 🔁 acceleration
	const ballColor = useRef('white');
	const ballShadowBlur = useRef(10); // flou initial
	const hasBeenTouched = useRef(false);

	const paddleHeight = 80;
	const paddleWidth = 10;
	const leftPaddle = useRef({ x: 10, y: canvasHeight / 2 - paddleHeight / 2 });
	const rightPaddle = useRef({ x: canvasWidth - 20, y: canvasHeight / 2 - paddleHeight / 2 });

	useEffect(() => {

		const keysPressed: Record<string, boolean> = {};

		const handleKeyDown = (e: KeyboardEvent) => { keysPressed[e.key] = true; };
		const handleKeyUp = (e: KeyboardEvent) => { keysPressed[e.key] = false; };

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const context = canvasRef.current!.getContext('2d')!;
		if (!context)
			return;

		let lastTime = performance.now();

		const baseSpeed = 200;
		const paddleSpeed = 300;

		const createExplosion = (x, y, color) => {
		const now = performance.now();
		const elapsed = (now - gameStartTime.current) / 1000; // en secondes

		const currentSpeed = Math.hypot(ball.current.vx, ball.current.vy);
		const normalizedSpeed = Math.min(currentSpeed / 500, 2); // Cap à 2x pour éviter l'excès

		const count = Math.floor(200 * normalizedSpeed); // Plus de particules si plus rapide
		const baseLifetime = 0.8; // secondes
		const lifetimeMultiplier = Math.min(1 + elapsed / 60, 2); // max ×2 après 60s de jeu

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * 2 * Math.PI;
			const speed = Math.random() * 200 + 100;
			particles.current.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				opacity: 1,
				color,
				size: Math.random() * 4 + 2,
				lifetime: baseLifetime * lifetimeMultiplier, // durée spécifique à chaque particule
				age: 0
			});
		}
	};

		const resetBall = (scoringPlayer: 'left' | 'right') => {
			if (scoringPlayer === 'left'  && hasBeenTouched.current)
				setLeftScore((s) => {
					leftScoreRef.current = s + 1;
					return s + 1;
				});
			else if (scoringPlayer === 'right'  && hasBeenTouched.current)
				setRightScore((s) => {
					rightScoreRef.current = s + 1;
					return s + 1;
				});

			createExplosion(ball.current.x, ball.current.y, ballColor.current);

			const totalScore = leftScoreRef.current + rightScoreRef.current;
			ballSpeedMultiplier.current = 1 + totalScore * 0.1; // +10% par point

			ballShadowBlur.current = 10;

			ball.current = {
				x: canvasWidth / 2,
				y: canvasHeight / 2,
				vx: (Math.random() > 0.5 ? 1 : -1) * baseSpeed,
				vy: (Math.random() > 0.5 ? 1 : -1) * baseSpeed * 0.5,
			};
			
			ballColor.current = 'white'; // reset color on score
			
			hasBeenTouched.current = false;

		};

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
			if (keysPressed['w'])
				leftPaddle.current.y += paddleSpeed * delta;
			if (keysPressed['s'])
				leftPaddle.current.y -= paddleSpeed * delta;

			if (keysPressed['ArrowUp'])
				rightPaddle.current.y -= paddleSpeed * delta;
			if (keysPressed['ArrowDown'])
				rightPaddle.current.y += paddleSpeed * delta;

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
				
				ballSpeedMultiplier.current += 0.1
				
				ballColor.current = 'cyan'; // Mettre à jour la couleur de la balle
				ballShadowBlur.current = Math.min(ballShadowBlur.current + 5, 50); // limite max 50
				
				hasBeenTouched.current = true;
			}

			// Right paddle collision
			if ( ball.current.x + 10 >= rightPaddle.current.x && ball.current.y >= rightPaddle.current.y && ball.current.y <= rightPaddle.current.y + paddleHeight)
			{
				const angle = calculateBounceAngle(rightPaddle.current.y, ball.current.y, paddleHeight);
				const speed = baseSpeed * ballSpeedMultiplier.current;

				ball.current.vx = -speed * Math.cos(angle);
				ball.current.vy = -speed * Math.sin(angle);
				ball.current.x = rightPaddle.current.x - 10;

				ballSpeedMultiplier.current += 0.1;

				ballColor.current = 'magenta'; // Mettre à jour la couleur de la balle
				ballShadowBlur.current = Math.min(ballShadowBlur.current + 5, 50); // limite max 50

				hasBeenTouched.current = true;
			}

			// Score if out
			if (ball.current.x < 0)
				resetBall('right');
			if (ball.current.x > canvasWidth)
				resetBall('left');

			// Mise à jour particules
			particles.current = particles.current.filter(p => p.opacity > 0);
			particles.current.forEach(p => {
				p.x += p.vx * delta;
				p.y += p.vy * delta;

				if (p.x <= 0 || p.x >= canvasWidth) {
					p.vx *= -1;
					p.x = Math.max(0, Math.min(canvasWidth, p.x));
				}
				if (p.y <= 0 || p.y >= canvasHeight) {
					p.vy *= -1;
					p.y = Math.max(0, Math.min(canvasHeight, p.y));
				}

				p.age += delta;
				p.opacity = Math.max(0, 1 - p.age / p.lifetime); // déclin progressif
			});

			// Nettoyage des particules mortes
			particles.current = particles.current.filter(p => p.opacity > 0);

			// Draw
			context.clearRect(0, 0, canvasWidth, canvasHeight);

			// Draw ball
			context.shadowColor = ballColor.current;
			context.shadowBlur = ballShadowBlur.current;
			context.fillStyle = ballColor.current;
			context.fillRect(ball.current.x, ball.current.y, 10, 10);

			// Draw left paddle with neon glow
			context.shadowColor = 'cyan';
			context.shadowBlur = 20;
			context.fillStyle = 'cyan';
			context.fillRect(leftPaddle.current.x, leftPaddle.current.y, paddleWidth, paddleHeight);

			// Draw right paddle with neon glow
			context.shadowColor = 'magenta'; // couleur différente pour contraste
			context.shadowBlur = 20;
			context.fillStyle = 'magenta';
			context.fillRect(rightPaddle.current.x, rightPaddle.current.y, paddleWidth, paddleHeight);

			// Draw particles
			particles.current.forEach(p => {
				context.shadowColor = p.color;
				context.shadowBlur = 20; // ou adapte la valeur si tu veux un effet plus ou moins flou

				context.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.opacity})`;
				context.beginPath();
				context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				context.fill();
			});

			// Reset shadows to prevent affecting other drawings
			context.shadowColor = 'transparent';
			context.shadowBlur = 0;

			requestAnimationFrame(loop);
		};

		resetBall(Math.random() > 0.5 ? 'left' : 'right'); // start random direction
		
		requestAnimationFrame(loop);

		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			
			<h1 className="text-center text-3xl font-bold text-cyan-400 font-mono mb-6 drop-shadow-lg">
				Pong Game
			</h1>

			<div className="bg-cyan-500 p-1 rounded-2xl shadow-2xl w-full max-w-3xl">
				
				<div className="bg-black bg-opacity-80 rounded-2xl px-8 py-6 text-white font-mono flex flex-col gap-6 items-center">
					
					<div className="flex justify-between w-full text-lg">
						<span style={{ textShadow: '0 0 16px cyan, 0 0 16px cyan', color: 'cyan' }}>Player 1: <strong>{leftScore}</strong></span>
						<span  style={{ textShadow: '0 0 16px magenta, 0 0 16px magenta', color: 'magenta' }}>Player 2: <strong>{rightScore}</strong></span>
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
