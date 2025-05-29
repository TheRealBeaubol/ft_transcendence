import React, { useEffect, useRef } from 'react';

const Pong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillText('Pong Game Here', 350, 200);
    }
  }, []);

  return <canvas ref={canvasRef} className="border" width={800} height={400}></canvas>;
};

export default Pong;
