/**
 * VIDEO TRANSITION MANAGER
 * Handles playback of Veo 3.1 transitions between site sections.
 * Supports Bridge (A->B) and Ouroboros (Loop) patterns.
 */

class VideoTransitionManager {
    constructor() {
        this.container = null;
        this.videoElement = null;
        this.currentTransition = null;
        this.isTransitioning = false;
        this.assetsPath = 'videos/transitions/';
        
        this.init();
    }

    init() {
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.id = 'transition-overlay';
        overlay.innerHTML = `
            <video id="transition-video" muted playsinline preload="auto"></video>
            <style>
                #transition-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9998;
                    background: #000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                }
                #transition-overlay.active {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                }
                #transition-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            </style>
        `;
        document.body.appendChild(overlay);
        this.container = overlay;
        this.videoElement = overlay.querySelector('video');
    }

    /**
     * Plays a bridge transition between two states
     * @param {string} from - Source state ID
     * @param {string} to - Target state ID
     * @param {function} onHalfway - Callback when video is at peak coverage
     */
    async playBridge(from, to, onHalfway) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const filename = `bridge-${from.toLowerCase()}-${to.toLowerCase()}.mp4`;
        const videoSrc = `${this.assetsPath}${filename}`;

        try {
            this.videoElement.src = videoSrc;
            await this.videoElement.load();

            // Show overlay
            this.container.classList.add('active');

            // Play video
            await this.videoElement.play();

            // Notify halfway (usually around the middle of the transition)
            const duration = this.videoElement.duration;
            setTimeout(() => {
                if (onHalfway) onHalfway();
            }, (duration * 1000) / 2);

            // Wait for end
            return new Promise((resolve) => {
                this.videoElement.onended = () => {
                    this.container.classList.remove('active');
                    this.isTransitioning = false;
                    resolve();
                };
            });
        } catch (e) {
            console.warn(`[Transitions] Failed to play bridge ${filename}:`, e);
            // Fallback: just do the callback and reset
            if (onHalfway) onHalfway();
            this.container.classList.remove('active');
            this.isTransitioning = false;
        }
    }

    /**
     * Plays an Ouroboros (loop) transition
     */
    async playLoop(type) {
        const filename = `ouroboros-${type}.mp4`;
        this.videoElement.src = `${this.assetsPath}${filename}`;
        this.videoElement.loop = true;
        this.container.classList.add('active');
        await this.videoElement.play();
    }

    stopLoop() {
        this.videoElement.pause();
        this.videoElement.loop = false;
        this.container.classList.remove('active');
    }
}

export const transitionManager = new VideoTransitionManager();
export default transitionManager;
