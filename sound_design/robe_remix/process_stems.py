import librosa
import numpy as np
import scipy.signal
import soundfile as sf
import os

SOURCE_FILE = "source_audio.wav"
SR = 44100

def apply_fade(audio, sr, duration=0.05):
    """Applies a short fade in/out to avoid clicks."""
    fade_len = int(duration * sr)
    if len(audio) < fade_len * 2:
        fade_len = len(audio) // 2
    
    fade_in = np.linspace(0, 1, fade_len)
    fade_out = np.linspace(1, 0, fade_len)
    
    audio[:fade_len] *= fade_in
    audio[-fade_len:] *= fade_out
    return audio

def create_loop_riser(y, sr):
    print("Generating Loop Riser...")
    # Extract 3:38 - 3:55
    start_sec = 3 * 60 + 38
    end_sec = 3 * 60 + 55
    segment = y[int(start_sec * sr):int(end_sec * sr)]
    
    # 1. Pitch Shift Ramp (Simulated via time stretching chunks or simple resampling for speed up)
    # A true pitch ramp without speed change is hard in vanilla librosa, 
    # so we'll do a "Tape Stop" style speed ramp UP (Pitch + Speed increase).
    # We will resample the audio to a gradually shorter length? No, simpler:
    # We'll just pitch shift the whole thing up by 2 semitones to make it tense,
    # and add a delay that pitches up.
    
    # Let's do a simple static pitch shift for tension first
    pitched = librosa.effects.pitch_shift(segment, sr=sr, n_steps=1.5)
    
    # Create a delay buffer that feeds back and pitches up
    delay_ms = 350 # ~1/4 note at 170 BPM (techno)
    delay_samples = int(delay_ms * SR / 1000)
    feedback = 0.6
    
    output = np.zeros(len(pitched) + sr * 2) # Add tail
    output[:len(pitched)] = pitched
    
    # Simple delay line implementation
    # For a "Rising" delay, we'd need to modulate read head. 
    # For now, let's just add a standard delay to fill the space.
    
    for i in range(delay_samples, len(output)):
        if i < len(pitched):
             input_val = pitched[i]
        else:
             input_val = 0
        
        # Feedback
        delayed_val = output[i - delay_samples] * feedback
        output[i] += delayed_val
        
    return apply_fade(output, sr)

def create_memory_glitch(y, sr):
    print("Generating Memory Glitch...")
    # Find a vocal "stuck" point. Let's look around 3:45 ("y yo que...").
    start_sec = 3 * 60 + 45.5
    duration = 0.2 # small chunk
    chunk = y[int(start_sec * sr):int((start_sec + duration) * sr)]
    
    # Create pattern: 4x 1/8th repeats, 8x 1/16th repeats
    # Assuming 120BPM for easy math (0.5s = beat). 
    # 1/8 = 0.25s, 1/16 = 0.125s.
    
    # Make chunk exactly 1/16th noteish length
    chunk_len = int(0.12 * sr)
    if len(chunk) > chunk_len:
        chunk = chunk[:chunk_len]
        
    pattern = []
    # 4x 1/8th (silence in between to make it stutter)
    for _ in range(4):
        pattern.append(chunk)
        pattern.append(np.zeros(chunk_len)) # Gap
        
    # 8x 1/16th (no gap, machinedrum style)
    for _ in range(8):
        pattern.append(chunk)
        
    full_glitch = np.concatenate(pattern)
    
    # Bandpass Filter Sweep
    # We'll filter the whole thing with a moving center frequency
    b, a = scipy.signal.butter(2, [500/(sr/2), 2000/(sr/2)], btype='band')
    filtered = scipy.signal.lfilter(b, a, full_glitch)
    
    # Add some bitcrush-like distortion (quantization)
    filtered = (np.round(filtered * 10) / 10)
    
    return apply_fade(filtered, sr)

def create_crowd_hit(y, sr):
    print("Generating Crowd Hit...")
    # Find a crowd cheer. End of loop (3:55) usually has reaction.
    start_sec = 3 * 60 + 53
    duration = 1.0
    extract = y[int(start_sec * sr):int((start_sec + duration) * sr)]
    
    # Transient Shaping: Enhance attack
    # Simple envelope
    envelope = np.ones_like(extract)
    # Fast attack
    attack_len = int(0.005 * sr)
    envelope[:attack_len] = np.linspace(0, 1, attack_len)
    # Decay to sustain
    decay_len = int(0.2 * sr)
    envelope[attack_len:attack_len+decay_len] = np.linspace(1, 0.6, decay_len)
    
    shaped = extract * envelope
    
    # Sidechain Simulation (Volume Ducking on the "kick" - assumed start of beat)
    # Duck first 100ms hard then recover
    duck_len = int(0.1 * sr)
    sc_curve = np.linspace(0.1, 1.0, duck_len)
    if len(shaped) > duck_len:
        shaped[:duck_len] *= sc_curve
        
    return apply_fade(shaped, sr)

def main():
    if not os.path.exists(SOURCE_FILE):
        print("Error: source_audio.wav not found. Run download_audio.py first.")
        return

    print("Loading audio...")
    y, sr = librosa.load(SOURCE_FILE, sr=SR)
    
    # 1. Loop Riser
    riser = create_loop_riser(y, sr)
    sf.write("loop_riser.wav", riser, sr)
    print("Saved loop_riser.wav")
    
    # 2. Memory Glitch
    glitch = create_memory_glitch(y, sr)
    sf.write("memory_glitch.wav", glitch, sr)
    print("Saved memory_glitch.wav")
    
    # 3. Crowd Hit
    hit = create_crowd_hit(y, sr)
    sf.write("crowd_hit.wav", hit, sr)
    print("Saved crowd_hit.wav")
    
    print("All stems processed.")

if __name__ == "__main__":
    main()
