/**
 * Video Showcase Controller
 * Auto-play videos on hover, pause on mouse leave
 */
(function() {
  function initVideoCards() {
    const cards = document.querySelectorAll('.video-card');
    
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;
      
      // Play on hover
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });
      
      // Pause on leave
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
      
      // Click to toggle fullscreen/lightbox
      card.addEventListener('click', () => {
        if (video.requestFullscreen) {
          video.muted = false;
          video.requestFullscreen().catch(() => {});
        } else if (video.webkitRequestFullscreen) {
          video.muted = false;
          video.webkitRequestFullscreen();
        }
        
        // Audio feedback
        if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
          AudioSynth.playArtworkReveal?.();
        }
      });
      
      // Touch support - toggle play on tap
      let isPlaying = false;
      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isPlaying) {
          video.pause();
          isPlaying = false;
        } else {
          video.play().catch(() => {});
          isPlaying = true;
        }
      }, { passive: false });
    });
  }
  
  // Initialize on DOM ready and view change
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoCards);
  } else {
    initVideoCards();
  }
  
  // Re-init on SPA navigation
  window.addEventListener('viewChange', initVideoCards);
})();
