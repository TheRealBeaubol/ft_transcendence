// src/utils/particles.ts

export function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let WIDTH = window.innerWidth;
  let HEIGHT = window.innerHeight;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  let particles: any[] = [];

  function randomDecimal(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        radius: randomDecimal(1, 5),
        x: randomInt(0, WIDTH),
        y: randomInt(0, HEIGHT),
        speed: randomDecimal(0.5, 1.5),
      });
    }
  }

  function newParticle() {
    return {
      radius: randomDecimal(1, 5),
      x: randomInt(0, WIDTH),
      y: 0,
      speed: randomDecimal(0.5, 1.5),
    };
  }

  function drawParticle(p: any) {
    ctx.beginPath();
    ctx.fillStyle = "#34FEE8";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#34FEE8";
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  function animateParticle(p: any) {
    if (p.y > HEIGHT) return newParticle();
    p.y += p.speed;
    return false;
  }

  function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const updated = animateParticle(p);
      if (updated) particles[i] = updated;
      drawParticle(p);
    }
    requestAnimationFrame(render);
  }

  function handleResize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    createParticles();
  }

  // Init
  window.addEventListener("resize", handleResize);
  createParticles();
  render();

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}
