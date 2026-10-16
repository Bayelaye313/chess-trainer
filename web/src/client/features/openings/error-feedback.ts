"use client";

/**
 * Retour sensoriel d'erreur du Mode Entraînement (méthode Listudy stricte,
 * voir `use-opening-drill.ts`) — partagé par `OpeningDrill` (catalogue) ET
 * `OpeningMistakeExercise` (journal des erreurs, voir `opening-mistakes-hub.tsx`) :
 * une seule mécanique de coup refusé, un seul endroit qui la traduit en
 * tremblement + bip.
 */
import { useEffect, useState } from "react";

/** Durée du tremblement CSS (`.animate-shake-error`, voir `globals.css`) — la classe est retirée après ce délai pour pouvoir se redéclencher sur l'erreur suivante. */
const SHAKE_DURATION_MS = 350;

/**
 * `true` pendant `SHAKE_DURATION_MS` à chaque INCRÉMENT de `errorPulse`
 * (voir `use-opening-drill.ts`) — ignore le retour à `0` d'un nouveau
 * `start()`, qui n'est jamais une vraie erreur.
 */
export function useErrorShake(errorPulse: number): boolean {
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (errorPulse === 0) return;
    playErrorSound();
    // `setState` déféré au prochain tick (jamais synchrone dans le corps de
    // l'effet, react-hooks/set-state-in-effect) — même convention que
    // `use-opening-drill.ts`.
    const onTimer = setTimeout(() => setShaking(true), 0);
    const offTimer = setTimeout(() => setShaking(false), SHAKE_DURATION_MS);
    return () => {
      clearTimeout(onTimer);
      clearTimeout(offTimer);
    };
  }, [errorPulse]);
  return shaking;
}

/**
 * Bip d'erreur — Web Audio plutôt qu'un fichier son : aucun asset à livrer,
 * un buzzer synthétique bref suffit et couplé au tremblement CSS
 * (`.animate-shake-error`) donne le retour "coup refusé" SANS le moindre
 * message texte, comme demandé.
 *
 * Chaque appel crée puis referme son propre `AudioContext` — un seul bip à la
 * fois n'a pas besoin d'en garder un ouvert entre deux appels, et ça évite
 * tout état à gérer côté React.
 */
export function playErrorSound(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(180, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
    oscillator.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // Best-effort : politique d'autoplay du navigateur, contexte de test
    // jsdom sans Web Audio, etc. — ne doit jamais bloquer le drill.
  }
}
