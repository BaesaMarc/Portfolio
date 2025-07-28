const numberOfStars = 1000;

const { innerWidth: vw, innerHeight: vh } = window;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

const mouse = {
  x: 0,
  y: 0,
  radius: 150,
}

window.addEventListener('mousemove', ({ x, y }) => {
  mouse.x = x;
  mouse.y = y;
})

canvas.setAttribute('width', vw);
canvas.setAttribute('height', vh);

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 40) + 5;
  }
  
  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  
  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.hypot(dx, dy);
    
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;
    
    const force = (mouse.radius - distance) / mouse.radius;
    
    if(distance < mouse.radius) {
      const directionX = forceDirectionX * force * this.density;
      const directionY = forceDirectionY * force * this.density;
      
      this.x -= directionX;
      this.y -= directionY;
      
      // Break execution
      return;
    }
    
    if(this.x !== this.baseX) {
      const distanceFromBase = this.x - this.baseX;
      
      this.x -= distanceFromBase / 10;
    }
    
    if(this.y !== this.baseY) {
      const distanceFromBase = this.y - this.baseY;
      
      this.y -= distanceFromBase / 10;
    }
  }
}

const init = () => {
  particlesArray = [];
  
  for(let i = 0; i < numberOfStars; i++) {
    const x = Math.random() * vw;
    const y = Math.random() * vh;
    
    particlesArray.push(new Particle(x, y));
  }
}

const animate = () => {
  ctx.clearRect(0, 0, vw, vh);
  
  for(const particle of particlesArray) {
    particle.draw();
    particle.update();
  }
  
  requestAnimationFrame(animate);
}

init();
animate();
