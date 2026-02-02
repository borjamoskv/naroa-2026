/**
 * MICA Video Engine - Sistema de Video Adaptativo Emocional
 * Streaming inteligente con overlays emocionales y calidad dinámica
 */

class MICAVideoEngine {
  constructor() {
    this.players = new Map();
    this.qualityLevels = [
      { label: 'SD', width: 640, bitrate: 800000 },
      { label: 'HD', width: 1280, bitrate: 2500000 },
      { label: 'FHD', width: 1920, bitrate: 5000000 }
    ];
  }

  initVideo(element) {
    const src = element.dataset.src;
    const gameId = element.dataset.game;
    
    const player = {
      element,
      src,
      currentQuality: this.selectInitialQuality(),
      hls: null,
      moodOverlay: null
    };
    
    if (src.includes('.m3u8') && !this.nativeHlsSupport()) {
      this.initHLS(player);
    } else {
      this.initNative(player);
    }
    
    this.addMoodOverlay(player);
    this.players.set(element, player);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo(player);
        } else {
          this.pauseVideo(player);
        }
      });
    });
    observer.observe(element);
  }

  nativeHlsSupport() {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  }

  selectInitialQuality() {
    const conn = navigator.connection;
    if (conn?.effectiveType === '4g') return 'FHD';
    if (conn?.effectiveType === '3g') return 'HD';
    return 'SD';
  }

  initNative(player) {
    player.element.src = player.src;
    player.element.load();
  }

  initHLS(player) {
    if (typeof Hls === 'undefined') {
      console.warn('HLS.js not loaded, falling back to native');
      this.initNative(player);
      return;
    }
    
    player.hls = new Hls({
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      enableWorker: true,
      startLevel: this.qualityLevels.findIndex(q => q.label === player.currentQuality)
    });
    
    player.hls.loadSource(player.src);
    player.hls.attachMedia(player.element);
  }

  loadVideo(player) {
    if (player.element.paused) {
      player.element.play().catch(() => {});
    }
  }

  pauseVideo(player) {
    player.element.pause();
  }

  addMoodOverlay(player) {
    const overlay = document.createElement('div');
    overlay.className = 'mica-video-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      mix-blend-mode: overlay;
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 10;
    `;
    
    player.element.parentNode.style.position = 'relative';
    player.element.parentNode.appendChild(overlay);
    player.moodOverlay = overlay;
    
    this.updateOverlayColor(player);
  }

  updateOverlayColor(player) {
    const colors = {
      NEUTRAL: 'transparent',
      ENERGETIC: 'rgba(229, 164, 123, 0.1)',
      TIRED: 'rgba(100, 100, 120, 0.2)',
      GRUMPY: 'rgba(200, 50, 50, 0.15)',
      PLAYFUL: 'rgba(255, 200, 50, 0.1)'
    };
    
    const currentMood = window.MICA?.currentMood || 'NEUTRAL';
    
    if (player.moodOverlay) {
      player.moodOverlay.style.backgroundColor = colors[currentMood];
      player.moodOverlay.style.opacity = currentMood === 'NEUTRAL' ? '0' : '1';
    }
  }

  applyMoodToAllVideos() {
    const currentMood = window.MICA?.currentMood || 'NEUTRAL';
    
    this.players.forEach(player => {
      this.updateOverlayColor(player);
      
      if (currentMood === 'GRUMPY') {
        player.element.style.filter = 'contrast(1.2) saturate(1.3)';
      } else if (currentMood === 'TIRED') {
        player.element.style.filter = 'brightness(0.9) grayscale(0.3)';
        player.element.playbackRate = 0.8;
      } else {
        player.element.style.filter = 'none';
        player.element.playbackRate = 1.0;
      }
    });
  }

  async captureThumbnail(videoElement, time = 1.0) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      videoElement.currentTime = time;
      videoElement.addEventListener('seeked', () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0);
        
        ctx.fillStyle = 'rgba(229, 164, 123, 0.3)';
        ctx.font = '20px serif';
        ctx.fillText('MICA', canvas.width - 60, canvas.height - 20);
        
        resolve(canvas.toDataURL('image/webp', 0.7));
      }, { once: true });
    });
  }

  initAllVideos() {
    document.querySelectorAll('video[data-mica-video="true"]').forEach(video => {
      this.initVideo(video);
    });
  }
}

const VideoEngine = new MICAVideoEngine();
if (typeof window !== 'undefined') window.VideoEngine = VideoEngine;
export default VideoEngine;
