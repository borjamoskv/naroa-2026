/**
 * MINERAL SFX — UI Feedback System
 * Subtle, high-frequency sounds for premium interactions
 */

const UISounds = {
    _sounds: {},
    _enabled: true,
    
    // Source: Mixkit / Pixabay (Royalty Free)
    _sources: {
        'hover': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Subtle digital plop
        'click': 'https://assets.mixkit.co/active_storage/sfx/2594/2594-preview.mp3', // Soft stone click
        'mica': 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3', // Magic glitter for MICA
        'transition': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' // Deep whoosh
    },
    
    init() {
        // Preload sounds
        for (const [name, url] of Object.entries(this._sources)) {
            const audio = new Audio(url);
            audio.volume = name === 'hover' ? 0.05 : 0.1;
            this._sounds[name] = audio;
        }
        
        this.bindEvents();
    },
    
    bindEvents() {
        // Magnetic buttons and gallery items
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('.magnetic-btn, .gallery__item, .nav__link, .mica-send-btn');
            if (el) this.play('hover');
        });
        
        document.addEventListener('click', (e) => {
            const el = e.target.closest('a, button, .gallery__item');
            if (el) this.play('click');
        });
        
        // Listen for custom MICA events
        document.addEventListener('mica-thought', () => this.play('mica'));
    },
    
    play(name) {
        if (!this._enabled || !this._sounds[name]) return;
        
        // Clone for overlapping plays
        const sound = this._sounds[name].cloneNode();
        sound.volume = this._sounds[name].volume;
        sound.play().catch(e => {}); // Ignore browser autoplay restrictions
    },
    
    toggle(state) {
        this._enabled = state;
    }
};

// Global instance
window.UISounds = UISounds;

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UISounds.init());
} else {
    UISounds.init();
}

export default UISounds;
