class CircuitAnimation {
    constructor() {
        this.canvas = document.getElementById('circuitCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.microprocessors = [];
        this.connections = [];
        this.particles = [];
        this.animationId = null;
       
        this.init();
    }

    init() {
        this.setupCanvas();
        this.getMicroprocessorPositions();
        this.createConnections();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
       
        // Redimensionner le canvas lors du resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.getMicroprocessorPositions();
            this.createConnections();
        });
    }

    getMicroprocessorPositions() {
        this.microprocessors = [];
        const elements = document.querySelectorAll('.microprocessor');
       
        elements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            this.microprocessors.push({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                element: element,
                id: index
            });
        });
    }

    createConnections() {
        this.connections = [];
        this.particles = [];
       
        // Trouver le processeur principal (celui au centre)
        const mainProcessor = this.microprocessors.find(proc =>
            proc.element.classList.contains('main-processor')
        );
       
        if (mainProcessor) {
            // Connecter le processeur principal à TOUS les autres processeurs
            this.microprocessors.forEach(processor => {
                if (processor !== mainProcessor) {
                    this.connections.push({
                        start: mainProcessor,
                        end: processor,
                        particles: [],
                        isMainConnection: true
                    });
                }
            });
        }
       
        // Créer aussi des connexions entre tous les processeurs périphériques
        for (let i = 0; i < this.microprocessors.length; i++) {
            for (let j = i + 1; j < this.microprocessors.length; j++) {
                // Éviter de dupliquer les connexions du processeur principal
                if (this.microprocessors[i] === mainProcessor || this.microprocessors[j] === mainProcessor) {
                    continue;
                }
               
                this.connections.push({
                    start: this.microprocessors[i],
                    end: this.microprocessors[j],
                    particles: [],
                    isMainConnection: false
                });
            }
        }

        // Créer des particules pour chaque connexion
        this.connections.forEach(connection => {
            // Plus de particules pour les connexions principales
            const particleCount = connection.isMainConnection ? 5 : 3;
           
            for (let i = 0; i < particleCount; i++) {
                connection.particles.push({
                    progress: Math.random(),
                    speed: connection.isMainConnection ?
                        0.008 + Math.random() * 0.012 :
                        0.005 + Math.random() * 0.008,
                    size: connection.isMainConnection ?
                        3 + Math.random() * 4 :
                        2 + Math.random() * 3,
                    brightness: Math.random(),
                    direction: Math.random() > 0.5 ? 1 : -1
                });
            }
        });
    }

    getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    drawConnection(connection) {
        const { start, end } = connection;
       
        // Intensité différente selon le type de connexion
        const isMain = connection.isMainConnection;
        const mainOpacity = isMain ? 0.5 : 0.3;
        const glowOpacity = isMain ? 0.2 : 0.1;
        const lineWidth = isMain ? 3 : 2;
        const glowWidth = isMain ? 8 : 6;
       
        // Dessiner la ligne de circuit avec effet néon
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
       
        // Ligne principale
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${mainOpacity})`;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
       
        // Effet de brillance
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${glowOpacity})`;
        this.ctx.lineWidth = glowWidth;
        this.ctx.stroke();
       
        // Effet supplémentaire pour les connexions principales
        if (isMain) {
            this.ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    drawParticle(connection, particle) {
        const { start, end } = connection;
       
        // Calculer la position de la particule le long de la ligne
        const x = start.x + (end.x - start.x) * particle.progress;
        const y = start.y + (end.y - start.y) * particle.progress;
       
        // Couleurs différentes selon le type de connexion
        const isMain = connection.isMainConnection;
        const primaryColor = isMain ? `rgba(0, 255, 255, ${particle.brightness})` : `rgba(0, 255, 255, ${particle.brightness * 0.8})`;
        const secondaryColor = isMain ? `rgba(255, 255, 255, ${particle.brightness * 0.7})` : `rgba(0, 150, 255, ${particle.brightness * 0.5})`;
        const trailColor = isMain ? `rgba(0, 255, 255, ${particle.brightness * 0.8})` : `rgba(0, 255, 255, ${particle.brightness * 0.6})`;
       
        // Dessiner la particule avec effet de brillance
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(0.3, secondaryColor);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
       
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
       
        // Halo supplémentaire pour les particules principales
        if (isMain) {
            const haloGradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
            haloGradient.addColorStop(0, `rgba(255, 255, 255, ${particle.brightness * 0.3})`);
            haloGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
           
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = haloGradient;
            this.ctx.fill();
        }
       
        // Traînée de la particule
        this.ctx.beginPath();
        const trailLength = isMain ? 30 : 20;
        const trailX = x - (end.x - start.x) * (particle.speed * trailLength) * particle.direction;
        const trailY = y - (end.y - start.y) * (particle.speed * trailLength) * particle.direction;
       
        const trailGradient = this.ctx.createLinearGradient(x, y, trailX, trailY);
        trailGradient.addColorStop(0, trailColor);
        trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
       
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(trailX, trailY);
        this.ctx.strokeStyle = trailGradient;
        this.ctx.lineWidth = particle.size / 2;
        this.ctx.stroke();
    }

    updateParticles() {
        this.connections.forEach(connection => {
            connection.particles.forEach(particle => {
                // Mettre à jour la position
                particle.progress += particle.speed * particle.direction;
               
                // Redémarrer la particule si elle atteint la fin
                if (particle.progress > 1 || particle.progress < 0) {
                    particle.progress = particle.direction > 0 ? 0 : 1;
                    particle.brightness = Math.random();
                    particle.speed = 0.005 + Math.random() * 0.01;
                }
               
                // Animation de la brillance
                particle.brightness += (Math.random() - 0.5) * 0.1;
                particle.brightness = Math.max(0.2, Math.min(1, particle.brightness));
            });
        });
    }

    animate() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
       
        // Dessiner les connexions
        this.connections.forEach(connection => {
            this.drawConnection(connection);
           
            // Dessiner les particules
            connection.particles.forEach(particle => {
                this.drawParticle(connection, particle);
            });
        });
       
        // Mettre à jour les particules
        this.updateParticles();
       
        // Continuer l'animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        // Gérer les clics sur les microprocesseurs
        document.querySelectorAll('.microprocessor').forEach(processor => {
            processor.addEventListener('click', (e) => {
                e.preventDefault();
               
                // Effet visuel de clic
                processor.style.transform = 'translate(-50%, -50%) scale(0.9)';
                setTimeout(() => {
                    processor.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }, 100);
                setTimeout(() => {
                    processor.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 200);
               
                // Redirection vers le lien
                const link = processor.getAttribute('data-link');
                if (link) {
                    window.open(link, '_blank');
                }
            });
           
            // Effet de survol amélioré
            processor.addEventListener('mouseenter', () => {
                // Intensifier les particules des connexions liées à ce processeur
                this.connections.forEach(connection => {
                    if (connection.start.element === processor || connection.end.element === processor) {
                        connection.particles.forEach(particle => {
                            particle.speed *= 2;
                            particle.brightness = Math.min(1, particle.brightness * 1.5);
                        });
                    }
                });
            });
           
            processor.addEventListener('mouseleave', () => {
                // Restaurer la vitesse normale
                this.connections.forEach(connection => {
                    if (connection.start.element === processor || connection.end.element === processor) {
                        connection.particles.forEach(particle => {
                            particle.speed *= 0.5;
                        });
                    }
                });
            });
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Effets de fond supplémentaires
class BackgroundEffects {
    constructor() {
        this.createStars();
        this.createFloatingParticles();
    }

    createStars() {
        const starContainer = document.createElement('div');
        starContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
       
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: #ffffff;
                border-radius: 50%;
                opacity: ${Math.random() * 0.8 + 0.2};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 4}s ease-in-out infinite alternate;
            `;
            starContainer.appendChild(star);
        }
       
        document.body.appendChild(starContainer);
       
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0% { opacity: 0.2; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    createFloatingParticles() {
        // Particules flottantes subtiles
        setInterval(() => {
            if (Math.random() > 0.7) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, rgba(0,255,255,0.6), transparent);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 0;
                    top: 100%;
                    left: ${Math.random() * 100}%;
                    animation: floatUp ${5 + Math.random() * 5}s linear forwards;
                `;
               
                document.body.appendChild(particle);
               
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 10000);
            }
        }, 2000);
       
        // Animation CSS pour les particules flottantes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les animations de circuits
    const circuitAnimation = new CircuitAnimation();
   
    // Initialiser les effets de fond
    const backgroundEffects = new BackgroundEffects();
   
    // Gérer la fermeture propre
    window.addEventListener('beforeunload', () => {
        circuitAnimation.destroy();
    });
   
    console.log('Animation des microprocesseurs initialisée !');
});