import React, { useEffect, useRef, useState } from 'react';

export default function PongGame() {
  const canvasRef = useRef(null);
  const [keys, setKeys] = useState({});

  const paddleHeight = 80;
  const paddleWidth = 10;
  const canvasWidth = 600;
  const canvasHeight = 400;

  const leftPaddle = useRef({ x: 10, y: canvasHeight / 2 - paddleHeight / 2 });
  const rightPaddle = useRef({ x: canvasWidth - 20, y: canvasHeight / 2 - paddleHeight / 2 });
  const ball = useRef({ x: canvasWidth / 2, y: canvasHeight / 2, vx: 3, vy: 2 });

  useEffect(() => {
    const handleKeyDown = (e) => setKeys((k) => ({ ...k, [e.key]: true }));
    const handleKeyUp = (e) => setKeys((k) => ({ ...k, [e.key]: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const context = canvasRef.current.getContext('2d');

    const gameLoop = () => {
      // Move paddles
      if (keys['w']) leftPaddle.current.y -= 5;
      if (keys['s']) leftPaddle.current.y += 5;
      if (keys['ArrowUp']) rightPaddle.current.y -= 5;
      if (keys['ArrowDown']) rightPaddle.current.y += 5;

      // Clamp paddle position
      leftPaddle.current.y = Math.max(0, Math.min(canvasHeight - paddleHeight, leftPaddle.current.y));
      rightPaddle.current.y = Math.max(0, Math.min(canvasHeight - paddleHeight, rightPaddle.current.y));

      // Move ball
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;

      // Bounce top/bottom
      if (ball.current.y <= 0 || ball.current.y >= canvasHeight) {
        ball.current.vy *= -1;
      }

      // Bounce paddles
      if (
        (ball.current.x <= leftPaddle.current.x + paddleWidth &&
          ball.current.y >= leftPaddle.current.y &&
          ball.current.y <= leftPaddle.current.y + paddleHeight) ||
        (ball.current.x >= rightPaddle.current.x - paddleWidth &&
          ball.current.y >= rightPaddle.current.y &&
          ball.current.y <= rightPaddle.current.y + paddleHeight)
      ) {
        ball.current.vx *= -1;
      }

      // Reset if out of bounds
      if (ball.current.x < 0 || ball.current.x > canvasWidth) {
        ball.current = { x: canvasWidth / 2, y: canvasHeight / 2, vx: 3 * (Math.random() > 0.5 ? 1 : -1), vy: 2 };
      }

      // Draw everything
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      // Ball
      context.fillRect(ball.current.x, ball.current.y, 10, 10);

      // Paddles
      context.fillRect(leftPaddle.current.x, leftPaddle.current.y, paddleWidth, paddleHeight);
      context.fillRect(rightPaddle.current.x, rightPaddle.current.y, paddleWidth, paddleHeight);

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  return (
	<div>
		<h1>test</h1>
		<div className="flex justify-center mt-4">
			<canvas ref={canvasRef} width={600} height={400} style={{ border: '1px solid black' }} />
		</div>
	</div>
  );
}
