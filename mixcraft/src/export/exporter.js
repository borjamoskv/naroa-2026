/* ═══════════════════════════════════════════════════
   Exporter — Offline rendering y descarga WAV
   ═══════════════════════════════════════════════════ */

export class Exporter {
  constructor() {
    this.isExporting = false;
    this.progress = 0;
  }

  // Export mix como WAV usando OfflineAudioContext
  async exportWAV(audioEngine, timeline, onProgress) {
    if (this.isExporting) return null;
    this.isExporting = true;
    this.progress = 0;

    const totalDuration = timeline.getTotalDuration();
    if (totalDuration <= 0) {
      this.isExporting = false;
      throw new Error('No hay tracks en el timeline');
    }

    const sampleRate = 44100;
    const channels = 2;
    const frameCount = Math.ceil(totalDuration * sampleRate);

    // Crear OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(channels, frameCount, sampleRate);

    // Renderizar cada track con su posición en el timeline
    for (let i = 0; i < timeline.tracks.length; i++) {
      const track = timeline.tracks[i];
      const deck = track.name === audioEngine.decks.A.name
        ? audioEngine.decks.A
        : audioEngine.decks.B;

      if (!deck || !deck.buffer) continue;

      // Crear source para este track
      const source = offlineCtx.createBufferSource();
      source.buffer = deck.buffer;

      // Gain node individual
      const gain = offlineCtx.createGain();
      gain.gain.value = 1;

      // Crossfade: fade in y fade out de 5 segundos
      const fadeTime = 5;
      const startTime = track.startTime;

      // Fade in
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(1, startTime + fadeTime);

      // Fade out
      const endTime = startTime + track.duration;
      gain.gain.setValueAtTime(1, Math.max(startTime + fadeTime, endTime - fadeTime));
      gain.gain.linearRampToValueAtTime(0, endTime);

      source.connect(gain);
      gain.connect(offlineCtx.destination);
      source.start(startTime);

      onProgress?.((i + 1) / timeline.tracks.length * 50);
    }

    // Render
    onProgress?.(50);
    const renderedBuffer = await offlineCtx.startRendering();
    onProgress?.(80);

    // Convertir a WAV
    const wavBlob = this._bufferToWav(renderedBuffer);
    onProgress?.(95);

    this.isExporting = false;
    this.progress = 100;
    onProgress?.(100);

    return wavBlob;
  }

  // Convertir AudioBuffer a WAV Blob
  _bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const bufferArr = new ArrayBuffer(44 + length);
    const view = new DataView(bufferArr);

    // WAV Header
    this._writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    this._writeString(view, 8, 'WAVE');
    this._writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);         // chunk size
    view.setUint16(20, 1, true);          // PCM format
    view.setUint16(22, numOfChan, true);  // channels
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numOfChan * 2, true); // byte rate
    view.setUint16(32, numOfChan * 2, true); // block align
    view.setUint16(34, 16, true);         // bits per sample
    this._writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Interleave samples
    const channels = [];
    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([bufferArr], { type: 'audio/wav' });
  }

  _writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Generar tracklist como texto
  static generateTrackList(timeline) {
    const tracks = timeline.tracks;
    const lines = [
      '═══════════════════════════════════',
      '  MIXCRAFT — Track List',
      '═══════════════════════════════════',
      '',
    ];

    tracks.forEach((track, i) => {
      const min = Math.floor(track.startTime / 60);
      const sec = Math.floor(track.startTime % 60);
      lines.push(`${(i + 1).toString().padStart(2, '0')}. [${min}:${sec.toString().padStart(2, '0')}] ${track.name}`);
      lines.push(`    ${track.bpm} BPM | ${track.key} | ${track.camelot}`);
      lines.push('');
    });

    lines.push('═══════════════════════════════════');
    lines.push(`  Mixed with MIXCRAFT v1`);
    lines.push('═══════════════════════════════════');

    return lines.join('\n');
  }

  // Descargar archivo
  static download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Descargar tracklist como TXT
  static downloadTrackList(timeline) {
    const text = Exporter.generateTrackList(timeline);
    const blob = new Blob([text], { type: 'text/plain' });
    Exporter.download(blob, 'mixcraft-tracklist.txt');
  }
}
