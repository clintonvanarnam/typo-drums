'use client';

export class DrumMachineEngine {
  private startFn: any = null;
  private Transport: any = null;
  private players: Map<string, any> = new Map();
  private sequence: any = null;
  private onStepCallback?: (step: number) => void;
  private currentStep = 0;

  async init(bpm: number, pattern: boolean[]) {
    // Dynamically import Tone.js - fixes SSR issues
    const ToneModule = await import('tone');
    // @ts-ignore - Handle both ESM and CommonJS module formats
    const Tone = ToneModule.default || ToneModule;
    
    this.startFn = Tone.start; // Store start function
    this.Transport = Tone.Transport; // Store Transport reference

    // Load a simple kick drum sample
    const kick = new Tone.Player({
      url: 'https://tonejs.github.io/audio/drum-samples/Kit7/kick.mp3',
      volume: -6,
    }).toDestination();

    await kick.load('https://tonejs.github.io/audio/drum-samples/Kit7/kick.mp3');
    this.players.set('kick', kick);

    // Set BPM
    this.Transport.bpm.value = bpm;

    // Create sequence
    this.sequence = new Tone.Sequence(
      (time: number, step: number) => {
        this.currentStep = step;

        if (pattern[step]) {
          const player = this.players.get('kick');
          if (player && player.loaded) {
            player.start(time);
          }
        }

        if (this.onStepCallback) {
          this.onStepCallback(step);
        }
      },
      Array.from({ length: pattern.length }, (_, i) => i),
      '8n'
    );

    this.sequence.loop = true;
  }

  async play() {
    // Start audio context on user gesture
    if (this.startFn) {
      await this.startFn();
    }
    
    if (this.sequence && this.Transport) {
      this.Transport.start();
      this.sequence.start(0);
    }
  }

  pause() {
    if (this.Transport) {
      this.Transport.pause();
    }
  }

  stop() {
    if (this.Transport) {
      this.Transport.stop();
      this.currentStep = 0;
    }
  }

  setBPM(bpm: number) {
    if (this.Transport) {
      this.Transport.bpm.value = bpm;
    }
  }

  onStep(callback: (step: number) => void) {
    this.onStepCallback = callback;
  }

  isPlaying(): boolean {
    return this.Transport ? this.Transport.state === 'started' : false;
  }

  dispose() {
    this.stop();
    if (this.sequence) {
      this.sequence.dispose();
    }
    this.players.forEach(player => player.dispose());
    this.players.clear();
  }
}