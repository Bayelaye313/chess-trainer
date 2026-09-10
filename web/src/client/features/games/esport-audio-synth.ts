/**
 * Moteur de synthèse sonore « e-sport » (§11b) — remplace le premier jet
 * (notes sinusoïdales nues) par un rendu sculpté : filtre passe-bas global
 * (`BiquadFilterNode`, réchauffe/étouffe les aigus agressifs), un bruit blanc
 * filtré pour la capture (impact mat plutôt qu'un simple bip), et des
 * enveloppes exponentielles en sortie (`exponentialRampToValueAtTime`) pour
 * éviter la coupure sèche façon 8-bit d'un `setValueAtTime(0, …)` brutal.
 *
 * Pur vis-à-vis de React et du cycle de vie de l'`AudioContext` : ce module
 * ne CRÉE ni ne referme aucun contexte — `playEsportAudioFx` reçoit un
 * contexte déjà prêt (voir `use-move-fx.ts`, qui garde la responsabilité de
 * sa création paresseuse, de sa reprise après suspension et du mute) et se
 * contente d'y brancher le graphe audio d'un seul déclenchement.
 *
 * `"development"`/`"neutral"` (les deux catégories de coup sain de
 * `MoveFxKind`, `core/analysis/move-fx.ts`) partagent le même clic discret
 * que `"move"` plus bas — ni l'une ni l'autre ne mérite sa propre texture,
 * la différenciation vit dans les six autres catégories.
 */
import type { MoveFxKind } from "@/core/analysis/move-fx";

/** Amorce une rampe depuis 0 avant l'attaque — évite le clic/pop d'un `setValueAtTime` non précédé d'un ramp depuis silence. */
function attackThenDecay(
  gainParam: AudioParam,
  now: number,
  peak: number,
  attackEnd: number,
  decayEnd: number,
): void {
  gainParam.setValueAtTime(0, now);
  gainParam.linearRampToValueAtTime(peak, attackEnd);
  gainParam.exponentialRampToValueAtTime(0.001, decayEnd);
}

export function playEsportAudioFx(ctx: AudioContext, kind: MoveFxKind): void {
  const now = ctx.currentTime;

  // Master Gain pour éviter les distorsions/saturations globales.
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(kind === "blunder" || kind === "critical" ? 0.35 : 0.25, now);
  masterGain.connect(ctx.destination);

  // Filtre passe-bas global : rend les sons plus chauds/mats (coupe les aigus agressifs) — sauf la Capture et la Gaffe, qui ont leur propre filtre dédié plus bas.
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(kind === "brilliant" ? 3500 : 1800, now);
  lowpass.connect(masterGain);

  switch (kind) {
    case "brilliant": {
      // Cristallin/clochette : deux sinusoïdes harmoniques (tierce), extinction longue.
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, now); // E6

      attackThenDecay(gain.gain, now, 0.8, now + 0.02, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(lowpass);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
      break;
    }

    case "critical": {
      // Alerte lourde et tendue : triangle grave, glissando descendant.
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(110, now); // A2
      osc.frequency.linearRampToValueAtTime(80, now + 0.4);

      attackThenDecay(gain.gain, now, 1.0, now + 0.05, now + 0.5);

      osc.connect(gain);
      gain.connect(lowpass);

      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }

    case "excellent": {
      // Correctif du 2026-09-10 : l'accord C5-E5-G5 en onde sinusoïdale
      // sonnait strident/aigu (retour utilisateur direct). Remplacé par un
      // accord feutré et descendant/posé (F4-A4-C5) en onde 'triangle' — bien
      // plus mat qu'une sinusoïde, cohérent avec le reste du fichier (le
      // "coup sain" par défaut plus bas utilise déjà 'triangle' pour la même
      // raison). Toujours branché sur `lowpass` (le filtre passe-bas global
      // du graphe, déjà réglé à 3500Hz pour "brilliant"/"excellent" en tête
      // de fonction) pour couper toute stridence résiduelle.
      const notes = [349.23, 440.0, 523.25]; // F4, A4, C5
      notes.forEach((freq, index) => {
        const start = now + index * 0.03;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.4, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(lowpass);

        osc.start(start);
        osc.stop(start + 0.2);
      });
      break;
    }

    case "blunder": {
      // Onde de choc sourde : dent de scie descendante, filtre dédié très bas (étouffe plus que le passe-bas global).
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const blunderFilter = ctx.createBiquadFilter();
      blunderFilter.type = "lowpass";
      blunderFilter.frequency.setValueAtTime(250, now);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.4);

      attackThenDecay(gain.gain, now, 1.2, now + 0.02, now + 0.6);

      osc.connect(gain);
      gain.connect(blunderFilter);
      blunderFilter.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.6);
      break;
    }

    case "capture": {
      // Impact mat et percutant : bruit blanc filtré en bande étroite (bois), pas un oscillateur — c'est ce qui le distingue des autres coups.
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.08));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(400, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(gain);
      gain.connect(masterGain);

      noiseNode.start(now);
      noiseNode.stop(now + 0.08);
      break;
    }

    case "castle": {
      // « Clac-clac » : deux impacts rapprochés (Roi puis Tour).
      [0, 0.12].forEach((delay) => {
        const start = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(280, start);
        attackThenDecay(gain.gain, start, 0.6, start + 0.01, start + 0.05);

        osc.connect(gain);
        gain.connect(lowpass);

        osc.start(start);
        osc.stop(start + 0.06);
      });
      break;
    }

    // "development"/"neutral" (coup sain, sans forme remarquable) : même clic
    // discret que le coup standard — voir le docstring du fichier.
    case "development":
    case "neutral":
    default: {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      attackThenDecay(gain.gain, now, 0.7, now + 0.005, now + 0.05);

      osc.connect(gain);
      gain.connect(lowpass);

      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
  }
}
