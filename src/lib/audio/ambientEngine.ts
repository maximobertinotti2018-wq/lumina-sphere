import type { AmbientScene } from './sceneDetector';

/**
 * ========================================
 * MOTOR DE AMBIENTE SONORO (Web Audio API)
 * ========================================
 * Genera paisajes sonoros en tiempo real, SIN archivos de audio: cada
 * ambiente se sintetiza con ruido filtrado y osciladores. Así no sumamos
 * peso al bundle ni dependemos de licencias de samples.
 *
 * Uso:
 *   const engine = new AmbientEngine();
 *   await engine.enable();          // requiere gesto del usuario (autoplay)
 *   engine.setScene('rain');        // crossfade suave a lluvia
 *   engine.setScene(null);          // silencio (fade out)
 *   engine.setVolume(0.5);
 *   engine.dispose();               // liberar todo
 */

interface Layer {
  output: GainNode;
  stop: () => void;
}

const FADE_SECONDS = 1.5;

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private current: Layer | null = null;
  private currentScene: AmbientScene | null = null;
  private volume = 0.6;

  /** Crea/reanuda el AudioContext. Debe llamarse desde un click del usuario. */
  async enable(): Promise<void> {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  get isEnabled(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  get scene(): AmbientScene | null {
    return this.currentScene;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.2);
    }
  }

  /** Cambia de ambiente con crossfade. `null` = silencio. */
  setScene(scene: AmbientScene | null): void {
    if (!this.ctx || !this.master) return;
    if (scene === this.currentScene) return;
    this.currentScene = scene;

    const now = this.ctx.currentTime;

    // Fade out + limpieza del ambiente anterior.
    if (this.current) {
      const old = this.current;
      old.output.gain.cancelScheduledValues(now);
      old.output.gain.setValueAtTime(old.output.gain.value, now);
      old.output.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
      window.setTimeout(() => old.stop(), (FADE_SECONDS + 0.1) * 1000);
      this.current = null;
    }

    if (!scene) return;

    // Fade in del nuevo.
    const layer = this.build(scene);
    layer.output.connect(this.master);
    layer.output.gain.setValueAtTime(0, now);
    layer.output.gain.linearRampToValueAtTime(1, now + FADE_SECONDS);
    this.current = layer;
  }

  dispose(): void {
    if (this.current) this.current.stop();
    this.current = null;
    this.currentScene = null;
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
    }
  }

  // ----------------------------------------
  // Generadores de ambiente
  // ----------------------------------------

  private build(scene: AmbientScene): Layer {
    switch (scene) {
      case 'rain': return this.buildRain();
      case 'tension': return this.buildTension();
      case 'wind': return this.buildWind();
      case 'sea': return this.buildSea();
      case 'fire': return this.buildFire();
    }
  }

  /** Buffer de ruido blanco de varios segundos, en loop. */
  private noiseSource(seconds = 4): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const frames = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.start();
    return src;
  }

  /** Lluvia: ruido con paso-alto (siseo) + una capa paso-bajo (fondo grave). */
  private buildRain(): Layer {
    const ctx = this.ctx!;
    const out = ctx.createGain();

    const noise = this.noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1000;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6000;
    noise.connect(hp).connect(lp).connect(out);

    // Modulación lenta de la intensidad → sensación de lluvia que va y viene.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 900;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();

    return {
      output: out,
      stop: () => { try { noise.stop(); lfo.stop(); } catch {} },
    };
  }

  /** Tensión/oscuridad: drone grave con osciladores en quinta + trémolo lento. */
  private buildTension(): Layer {
    const ctx = this.ctx!;
    const out = ctx.createGain();

    const freqs = [55, 58.5, 82.5]; // La grave + leve batido + quinta
    const oscs = freqs.map((f) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.08;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 320;
      o.connect(lp).connect(g).connect(out);
      o.start();
      return o;
    });

    // Swell de amplitud muy lento → respiración inquietante.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    const base = ctx.createConstantSource();
    base.offset.value = 0.6;
    base.connect(out.gain);
    lfo.connect(lfoGain).connect(out.gain);
    lfo.start();
    base.start();

    return {
      output: out,
      stop: () => { try { oscs.forEach((o) => o.stop()); lfo.stop(); base.stop(); } catch {} },
    };
  }

  /** Viento: ruido con paso-banda que barre de frecuencia (ráfagas). */
  private buildWind(): Layer {
    const ctx = this.ctx!;
    const out = ctx.createGain();

    const noise = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 2.5;
    noise.connect(bp).connect(out);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain).connect(bp.frequency);
    lfo.start();

    return {
      output: out,
      stop: () => { try { noise.stop(); lfo.stop(); } catch {} },
    };
  }

  /** Mar: ruido paso-bajo con envolvente lenta → olas que suben y bajan. */
  private buildSea(): Layer {
    const ctx = this.ctx!;
    const out = ctx.createGain();

    const noise = this.noiseSource();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.4;
    noise.connect(lp).connect(waveGain).connect(out);

    // Olas: ~1 cada 6-7s.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain).connect(waveGain.gain);
    lfo.start();

    return {
      output: out,
      stop: () => { try { noise.stop(); lfo.stop(); } catch {} },
    };
  }

  /** Fuego: ruido grave (rugido) + crepitar aleatorio de chispas. */
  private buildFire(): Layer {
    const ctx = this.ctx!;
    const out = ctx.createGain();

    const noise = this.noiseSource();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    const roar = ctx.createGain();
    roar.gain.value = 0.5;
    noise.connect(lp).connect(roar).connect(out);

    // Chasquidos: pequeños golpes de ruido a intervalos irregulares.
    let stopped = false;
    const crackle = () => {
      if (stopped || !this.ctx) return;
      const n = this.noiseSource(0.05);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800 + Math.random() * 2000;
      const g = ctx.createGain();
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25 + Math.random() * 0.25, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      n.connect(bp).connect(g).connect(out);
      window.setTimeout(() => { try { n.stop(); } catch {} }, 120);
      window.setTimeout(crackle, 120 + Math.random() * 500);
    };
    crackle();

    return {
      output: out,
      stop: () => { stopped = true; try { noise.stop(); } catch {} },
    };
  }
}
