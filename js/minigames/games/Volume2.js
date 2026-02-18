import { MicaMinigame } from '../core/MicaMinigame.js';

// ============================================
// JUEGO 11: ESCAPE DE LA CAJA
// ============================================
export class EscapeCaja extends MicaMinigame {
  constructor() { super({ id: 'escape-caja', titulo: 'ESCAPE DE LA CAJA', obra: 'En Caja', duracion: 60, frases: ["¡El sello de correos!", "¡LIBERTAD!", "¿A dónde te envían?"] }); this.objetivoMax = 5; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && e.code === 'Space') this.exito(); }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 0, 800, 600); ctx.fillStyle = '#DEB887'; ctx.fillRect(200, 150, 400, 300); ctx.font = '100px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('📦', 400, 350); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.fillText('¡Pulsa ESPACIO para escapar!', 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 12: CARRERA CONTRA EL TIEMPO
// ============================================
export class CarreraTiempo extends MicaMinigame {
  constructor() { super({ id: 'tiempo', titulo: 'CARRERA CONTRA EL TIEMPO', obra: 'Es la Hora', duracion: 60, frases: ["¡TICK TACK!", "¡5 segundos!", "¡JUSTO A TIEMPO!"] }); this.objetivoMax = 10; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo) this.exito(); }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600); ctx.font = '150px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⏰', 400, 350); ctx.font = '30px sans-serif'; ctx.fillStyle = '#FF0'; ctx.fillText(`Microtareas: ${this.puntuacion}/${this.objetivoMax}`, 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 13: COPIA TU REFLEJO
// ============================================
export class CopiaReflejo extends MicaMinigame {
  constructor() { super({ id: 'espejo', titulo: 'COPIA TU REFLEJO', obra: 'Espejos del Alma', duracion: 45, frases: ["¡Esa pose no!", "¡ESPEJO PERFECTO!", "El reflejo miente..."] }); this.objetivoMax = 20; this.poseActual = '🧍'; this.poses = ['🧍', '🙆', '🤷', '💃', '🧘']; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && ['1','2','3','4','5'].includes(e.key)) { if (this.poses[parseInt(e.key)-1] === this.poseActual) { this.exito(); this.poseActual = this.poses[Math.floor(Math.random()*5)]; } else this.fallo(); } }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#E0E0E0'; ctx.fillRect(0, 0, 800, 600); ctx.font = '120px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.poseActual, 400, 300); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText('1:🧍 2:🙆 3:🤷 4:💃 5:🧘', 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 14: VUELO DEL AMOR
// ============================================
export class VueloAmor extends MicaMinigame {
  constructor() { super({ id: 'vuelo', titulo: 'VUELO DEL AMOR', obra: 'Soy un amor y tengo alas', duracion: 60, frases: ["¡ALETEA!", "¡Corazón roto a las 3!", "¡AMOR INFINITO!"] }); this.objetivoMax = 1000; this.y = 300; this.velocidad = 0; this.obstaculos = []; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && e.code === 'Space') this.velocidad = -8; }); }
  start() { setInterval(() => { if (this.activo) this.obstaculos.push({ x: 820, y: Math.random() * 400 + 100, tipo: Math.random() > 0.5 ? '💔' : '❤️' }); }, 1500); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; this.velocidad += 0.4; this.y += this.velocidad; this.y = Math.max(50, Math.min(550, this.y)); ctx.fillStyle = '#FFB6C1'; ctx.fillRect(0, 0, 800, 600); ctx.font = '50px sans-serif'; ctx.fillText('😇', 100, this.y); this.obstaculos = this.obstaculos.filter(o => o.x > -50); this.obstaculos.forEach(o => { o.x -= 5; ctx.fillText(o.tipo, o.x, o.y); if (o.x < 150 && o.x > 50 && Math.abs(o.y - this.y) < 40) { if (o.tipo === '💔') this.fallo(); else this.exito(); o.x = -100; } }); this.puntuacion++; ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.fillText(`Distancia: ${this.puntuacion}m`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 15: BRILLA MÁS
// ============================================
export class BrillaMas extends MicaMinigame {
  constructor() { super({ id: 'brilla', titulo: 'BRILLA MÁS', obra: 'Pink and Sparkles', duracion: 45, frases: ["¡ESE BRILLO!", "¡Se apagan!", "¡MODO PURPURINA!"] }); this.objetivoMax = 100; this.sparkles = []; }
  setupControls() { this.canvas.addEventListener('click', e => { if (!this.activo) return; const rect = this.canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top; this.sparkles = this.sparkles.filter(s => { if (Math.abs(s.x - x) < 30 && Math.abs(s.y - y) < 30) { this.exito(); return false; } return true; }); }); }
  start() { setInterval(() => { if (this.activo && this.sparkles.length < 20) this.sparkles.push({ x: Math.random() * 750 + 25, y: Math.random() * 550 + 25, vida: 100 }); }, 300); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#FF69B4'; ctx.fillRect(0, 0, 800, 600); this.sparkles = this.sparkles.filter(s => { s.vida--; return s.vida > 0; }); this.sparkles.forEach(s => { ctx.font = `${20 + s.vida/5}px sans-serif`; ctx.fillText('✨', s.x, s.y); }); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.fillText(`Sparkles: ${this.puntuacion}/${this.objetivoMax}`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 16: PIROPOS EXTREMOS
// ============================================
export class PiroposExtremos extends MicaMinigame {
  constructor() { super({ id: 'piropos', titulo: 'PIROPOS EXTREMOS', obra: 'Papitxulo', duracion: 60, frases: ["¡Ese piropo era MALO!", "¡CASANOVA!", "Papitxulo aprueba"] }); this.objetivoMax = 30; this.piropoActual = ''; this.piropos = ['Eres más bonita que un amanecer', 'Tienes los ojos del color del mar', 'Tu sonrisa ilumina la habitación']; this.input = ''; }
  setupControls() { document.addEventListener('keydown', e => { if (!this.activo) return; if (e.key === 'Enter') { if (this.input.length > 5) { this.exito(); this.input = ''; this.nuevoPiropo(); } } else if (e.key === 'Backspace') { this.input = this.input.slice(0, -1); } else if (e.key.length === 1) { this.input += e.key; } }); }
  nuevoPiropo() { this.piropoActual = this.piropos[Math.floor(Math.random() * this.piropos.length)]; }
  start() { this.nuevoPiropo(); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#FF1493'; ctx.fillRect(0, 0, 800, 600); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.fillText(`Escribe: "${this.piropoActual}"`, 400, 200); ctx.fillText(`Tu texto: ${this.input}_`, 400, 400); ctx.fillText(`Piropos: ${this.puntuacion}/${this.objetivoMax}`, 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 17: LANZA MONEDAS
// ============================================
export class LanzaMonedas extends MicaMinigame {
  constructor() { super({ id: 'monedas', titulo: 'LANZA MONEDAS', obra: 'Buena Fuente', duracion: 60, frases: ["¡Muy fuerte!", "¡DESEO CONCEDIDO!", "¿Eso era un botón?"] }); this.objetivoMax = 10; this.fuerza = 0; this.lanzando = false; }
  setupControls() { document.addEventListener('keydown', e => { if (!this.activo) return; if (e.code === 'Space') { this.lanzando = true; } }); document.addEventListener('keyup', e => { if (!this.activo) return; if (e.code === 'Space' && this.lanzando) { this.lanzando = false; if (this.fuerza > 40 && this.fuerza < 70) this.exito(); else this.fallo(); this.fuerza = 0; } }); }
  gameLoop() { if (!this.activo) return; if (this.lanzando) this.fuerza = Math.min(100, this.fuerza + 2); const ctx = this.ctx; ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, 800, 600); ctx.fillStyle = '#4169E1'; ctx.beginPath(); ctx.arc(400, 400, 100, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#DDD'; ctx.fillRect(350, 100, 100, 30); ctx.fillStyle = this.fuerza > 40 && this.fuerza < 70 ? '#4CAF50' : '#FF5722'; ctx.fillRect(350, 100, this.fuerza, 30); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.fillText('Mantén ESPACIO para cargar fuerza', 400, 50); ctx.fillText(`Aciertos: ${this.puntuacion}/${this.objetivoMax}`, 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 18: CONTAGIA LA SONRISA
// ============================================
export class ContagiaSonrisa extends MicaMinigame {
  constructor() { super({ id: 'sonrisa', titulo: 'CONTAGIA LA SONRISA', obra: 'Smile and the World Smiles Back', duracion: 60, frases: ["¡Ese estaba triste!", "¡SONRISA VIRAL!", "¡El mundo sonríe!"] }); this.objetivoMax = 100; this.personas = []; }
  setupControls() { this.canvas.addEventListener('click', e => { if (!this.activo) return; const rect = this.canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top; this.personas.forEach(p => { if (Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 30 && !p.sonrie) { p.sonrie = true; this.exito(); } }); }); }
  start() { for (let i = 0; i < 20; i++) this.personas.push({ x: Math.random() * 700 + 50, y: Math.random() * 500 + 50, sonrie: false }); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#FFFACD'; ctx.fillRect(0, 0, 800, 600); this.personas.forEach(p => { ctx.font = '40px sans-serif'; ctx.fillText(p.sonrie ? '😊' : '😐', p.x, p.y); }); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.fillText(`Sonrisas: ${this.puntuacion}/${this.objetivoMax}`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 19: CONQUISTA EL MUNDO
// ============================================
export class ConquistaMundo extends MicaMinigame {
  constructor() { super({ id: 'mundo', titulo: 'CONQUISTA EL MUNDO', obra: 'The World is Yours', duracion: 90, frases: ["¡Ese territorio era mío!", "¡EMPERADOR!", "¿Eso es Andorra?"] }); this.objetivoMax = 51; this.territorios = []; }
  setupControls() { this.canvas.addEventListener('click', e => { if (!this.activo) return; const rect = this.canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top; this.territorios.forEach(t => { if (Math.abs(t.x - x) < 40 && Math.abs(t.y - y) < 40 && !t.conquistado) { t.conquistado = true; this.exito(); } }); }); }
  start() { for (let i = 0; i < 100; i++) this.territorios.push({ x: Math.random() * 750 + 25, y: Math.random() * 550 + 25, conquistado: false }); super.start(); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; ctx.fillStyle = '#228B22'; ctx.fillRect(0, 0, 800, 600); this.territorios.forEach(t => { ctx.fillStyle = t.conquistado ? '#FFD700' : '#8B4513'; ctx.beginPath(); ctx.arc(t.x, t.y, 15, 0, Math.PI * 2); ctx.fill(); }); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.fillText(`Territorios: ${this.puntuacion}%`, 400, 50); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 20: AMOR EN 4D
// ============================================
export class Amor4D extends MicaMinigame {
  constructor() { super({ id: 'amor4d', titulo: 'AMOR EN 4D', obra: 'Multidimensional Love', duracion: 60, frases: ["¡Esa dimensión no!", "¡AMOR CUÁNTICO!", "El tiempo es relativo"] }); this.objetivoMax = 10; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo && ['1','2','3','4'].includes(e.key)) this.exito(); }); }
  gameLoop() { if (!this.activo) return; const ctx = this.ctx; const hue = (Date.now() / 20) % 360; ctx.fillStyle = `hsl(${hue}, 50%, 30%)`; ctx.fillRect(0, 0, 800, 600); ctx.font = '100px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💕', 400 + Math.sin(Date.now()/200)*50, 300 + Math.cos(Date.now()/300)*50); ctx.font = '24px sans-serif'; ctx.fillStyle = '#FFF'; ctx.fillText('Pulsa 1-4 para conectar dimensiones', 400, 550); requestAnimationFrame(() => this.gameLoop()); }
}

// ============================================
// JUEGO 21: NO TE DUERMAS ABUELO
// ============================================
export class NoTeDuermasAbuelo extends MicaMinigame {
  constructor() { super({ id: 'abuelo', titulo: 'NO TE DUERMAS ABUELO', obra: 'Viejuno', duracion: 60, frases: ["¡Se duerme!", "¡ABUELO ACTIVO!", "Un ronquido = game over"] }); this.objetivoMax = 60; this.sueno = 0; this.decaimiento = 0.3; }
  setupControls() { document.addEventListener('keydown', e => { if (this.activo) { this.sueno = Math.max(0, this.sueno - 20); this.exito(); } }); }
  gameLoop() { if (!this.activo) return; this.sueno += this.decaimiento; if (this.sueno >= 100) { this.fallo(); this.sueno = 50; } const ctx = this.ctx; ctx.fillStyle = '#DEB887'; ctx.fillRect(0, 0, 800, 600); ctx.font = '120px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.sueno > 70 ? '😴' : this.sueno > 40 ? '😪' : '👴', 400, 350); ctx.fillStyle = '#8B4513'; ctx.fillRect(200, 500, 400, 30); ctx.fillStyle = this.sueno > 70 ? '#FF0000' : '#FFA500'; ctx.fillRect(200, 500, this.sueno * 4, 30); ctx.font = '24px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText('¡Pulsa teclas para mantenerlo despierto!', 400, 50); this.puntuacion = this.duracion - this.tiempoRestante; requestAnimationFrame(() => this.gameLoop()); }
}
