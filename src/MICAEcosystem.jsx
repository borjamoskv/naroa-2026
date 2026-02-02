import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function App() {
  const [currentMood, setCurrentMood] = useState('ENERGETIC');
  const [seasonalContext, setSeasonalContext] = useState('VERANO');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  // Tritono color palette inspired by Naroa's artwork
  const colorPalettes = {
    ENERGETIC: { 
      primary: '#E8B49D', 
      secondary: '#F5E9D7', 
      accent: '#D4A59A',
      particles: ['#E8B49D', '#F5E9D7', '#D4A59A', '#C19A8C']
    },
    TIRED: { 
      primary: '#5D4B46', 
      secondary: '#8C7B75', 
      accent: '#A89F91',
      particles: ['#5D4B46', '#8C7B75', '#A89F91', '#C1B8A9']
    },
    GRUMPY: { 
      primary: '#2A2D3A', 
      secondary: '#4A4A6A', 
      accent: '#8A6A6A',
      particles: ['#2A2D3A', '#4A4A6A', '#8A6A6A', '#6A4A4A']
    },
    PLAYFUL: { 
      primary: '#F5A9B8', 
      secondary: '#F9D57A', 
      accent: '#A8D8B9',
      particles: ['#F5A9B8', '#F9D57A', '#A8D8B9', '#8A9BD8']
    }
  };

  // Seasonal context detection
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 5 && month <= 8) setSeasonalContext('VERANO');
    else if (month === 11 && now.getDate() >= 20) setSeasonalContext('NAVIDAD');
    else if (month === 7) setSeasonalContext('AGOSTO');
    else if (month === 3 && now.getDate() >= 2 && now.getDate() <= 10) setSeasonalContext('SEMANA_SANTA');
    else setSeasonalContext('NORMAL');
  }, []);

  // Particle system implementation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let animationFrameId;
    let particles = [];
    const palette = colorPalettes[currentMood].particles;
    const maxParticles = 300;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.life = 1;
        this.emotionalWeight = Math.random();
      }
      
      update(mood) {
        switch(mood) {
          case 'ENERGETIC':
            this.speedX += (Math.random() - 0.5) * 0.3;
            this.speedY += (Math.random() - 0.5) * 0.3;
            this.size = 3 + Math.sin(Date.now() / 100) * 2;
            break;
          case 'TIRED':
            this.speedY -= 0.02;
            this.speedX *= 0.98;
            break;
          case 'GRUMPY':
            const dx = this.x - canvas.width / 2;
            const dy = this.y - canvas.height / 2;
            if (Math.sqrt(dx*dx + dy*dy) < 200) {
              this.speedX += dx * 0.001;
              this.speedY += dy * 0.001;
            }
            break;
          case 'PLAYFUL':
            this.speedX = Math.sin(Date.now() / 1000 + this.x * 0.01) * 2;
            this.speedY = Math.cos(Date.now() / 1200 + this.y * 0.01) * 2;
            break;
        }
        
        this.speedX = Math.max(Math.min(this.speedX, 3), -3);
        this.speedY = Math.max(Math.min(this.speedY, 3), -3);
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -0.8;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -0.8;
        this.life -= 0.01;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x / dpr, this.y / dpr, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < Math.min(maxParticles, (canvas.width * canvas.height) / 10000); i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(248, 245, 240, 0.9)');
      gradient.addColorStop(1, 'rgba(232, 180, 157, 0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.update(currentMood);
        particle.draw();
        if (particle.life <= 0) {
          particles.splice(i, 1);
          particles.push(new Particle());
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    initParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentMood]);

  const seasonalPhrases = {
    'VERANO': ["La luz de verano transforma cada pixel en poesía visual"],
    'NAVIDAD': ["Entre luces y sombras, creamos nuevos universos"],
    'AGOSTO': ["Modo agosto: creatividad relajada y sin prisas"],
    'SEMANA_SANTA': ["En el silencio, encontramos la esencia de la creación"],
    'NORMAL': ["El proceso creativo es un viaje sin mapa"]
  };

  const moodInteractions = {
    ENERGETIC: "MICA está vibrante hoy. Las partículas bailan con energía creativa.",
    TIRED: "MICA descansa. Las partículas flotan como hojas en otoño.",
    GRUMPY: "MICA es crítica hoy. Las partículas huyen de tu cursor.",
    PLAYFUL: "MICA juega contigo. Las partículas forman patrones caóticos."
  };

  return (
    <div ref={containerRef} className="relative bg-[#F8F5F0] font-sans overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />
      
      {/* Mood Selector */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
        {Object.keys(colorPalettes).map((mood) => (
          <motion.button
            key={mood}
            whileHover={{ scale: 1.1 }}
            onClick={() => setCurrentMood(mood)}
            className={`w-12 h-12 rounded-full border-2 ${currentMood === mood ? 'border-black scale-110' : 'border-white/50'}`}
            style={{ backgroundColor: colorPalettes[mood].primary }}
          />
        ))}
      </div>
      
      {/* Hero Section */}
      <motion.section style={{ opacity, scale }} className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm mb-6">
              <span className="text-xs font-medium uppercase text-[#5D4B46]">Ecosistema Creativo MICA</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#E8B49D] to-[#5D4B46]">Inteligencia Creativa</span>
              <span className="block mt-2 text-[#2A2D3A]">con Alma Vasca</span>
            </h1>
            <p className="text-xl text-[#5D4B46] max-w-3xl mx-auto">
              Un asistente de diseño que piensa, siente y crea como una artista. Inspirado en Naroa Gutiérrez Gil.
            </p>
          </motion.div>
          
          <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl max-w-2xl mx-auto">
            <p className="text-lg italic text-[#5D4B46]">"{seasonalPhrases[seasonalContext][0]}"</p>
            <p className="text-sm text-[#8C7B75] mt-2">MICA • {moodInteractions[currentMood]}</p>
          </div>
        </div>
      </motion.section>
      
      {/* Floating mood indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2.5 shadow-lg flex items-center">
          <div className="w-3 h-3 rounded-full mr-3 animate-pulse" style={{ backgroundColor: colorPalettes[currentMood].primary }} />
          <span className="text-sm font-medium text-[#5D4B46]">MICA: modo {currentMood.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}
