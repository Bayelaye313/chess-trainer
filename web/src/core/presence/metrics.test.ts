import { describe, expect, it } from "vitest";
import {
  activeCounts,
  activeUsersPerDay,
  averageActiveSeconds,
  creditHeartbeat,
  isActive,
  isOnline,
  isSessionActive,
  lastDays,
  onlineBySection,
  parseSection,
  retention,
  sectionOfPath,
  signupsPerDay,
  utcDay,
} from "./metrics";

const NOW = new Date("2026-11-04T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const DAY = 24 * 60 * 60 * 1000;

describe("présence", () => {
  it("en ligne = dernier battement il y a moins de 2 minutes", () => {
    expect(isOnline(ago(0), NOW)).toBe(true);
    expect(isOnline(ago(119_999), NOW)).toBe(true);
    expect(isOnline(ago(120_000), NOW)).toBe(false);
    expect(isOnline(null, NOW)).toBe(false);
  });

  it("crédite le temps écoulé (plafonné à 60 s) et ouvre une session après 2 minutes de silence", () => {
    expect(creditHeartbeat(null, NOW)).toEqual({ seconds: 0, newSession: true });
    expect(creditHeartbeat(ago(60_000), NOW)).toEqual({ seconds: 60, newSession: false });
    expect(creditHeartbeat(ago(90_000), NOW)).toEqual({ seconds: 60, newSession: false });
    expect(creditHeartbeat(ago(20_000), NOW)).toEqual({ seconds: 20, newSession: false });
    expect(creditHeartbeat(ago(180_000), NOW)).toEqual({ seconds: 0, newSession: true });
  });

  it("ne transmet que des sections, jamais d'URL", () => {
    expect(sectionOfPath("/")).toBe("aujourdhui");
    expect(sectionOfPath("/analyse/1234-secret")).toBe("progres");
    expect(sectionOfPath("/pieges/fried-liver")).toBe("entrainer");
    expect(sectionOfPath("/inconnu")).toBe("autre");
    expect(parseSection("jouer")).toBe("jouer");
    expect(parseSection("/jouer")).toBeNull();
    expect(parseSection(42)).toBeNull();
  });

  it("répartit les utilisateurs en ligne par section", () => {
    const rows = [
      { userId: "a", lastSeenAt: ago(10_000), currentSection: "jouer" },
      { userId: "b", lastSeenAt: ago(30_000), currentSection: "jouer" },
      { userId: "c", lastSeenAt: ago(5_000), currentSection: "programme" },
      { userId: "d", lastSeenAt: ago(10 * 60_000), currentSection: "jouer" },
    ];
    expect(onlineBySection(rows, NOW)).toEqual([
      { section: "jouer", count: 2 },
      { section: "programme", count: 1 },
    ]);
  });
});

describe("activité", () => {
  const rows = [
    { userId: "a", day: "2026-11-04", activeSeconds: 600 },
    { userId: "b", day: "2026-11-04", activeSeconds: 59 },
    { userId: "b", day: "2026-11-03", activeSeconds: 30 },
    { userId: "c", day: "2026-10-30", activeSeconds: 120 },
    { userId: "d", day: "2026-10-10", activeSeconds: 3600 },
    { userId: "e", day: "2026-09-01", activeSeconds: 3600 },
  ];

  it("actif = au moins 60 s cumulées sur la période ; DAU / WAU / MAU glissants", () => {
    expect(isActive(59)).toBe(false);
    expect(isActive(60)).toBe(true);
    // b : 59 s aujourd'hui (inactif au jour), 89 s sur 7 jours (actif sur la semaine).
    expect(activeCounts(rows, NOW)).toEqual({ dau: 1, wau: 3, mau: 4 });
  });

  it("jours UTC et fenêtres glissantes", () => {
    expect(utcDay(new Date("2026-11-04T23:59:59Z"))).toBe("2026-11-04");
    expect(lastDays(NOW, 3)).toEqual(["2026-11-02", "2026-11-03", "2026-11-04"]);
    expect(lastDays(NOW, 30)).toHaveLength(30);
  });

  it("séries quotidiennes : actifs et inscriptions", () => {
    const series = activeUsersPerDay(rows, NOW, 7);
    expect(series.at(-1)).toEqual({ day: "2026-11-04", value: 1 });
    expect(series.find((p) => p.day === "2026-10-30")?.value).toBe(1);
    const signups = signupsPerDay([new Date("2026-11-04T08:00:00Z"), new Date("2026-11-04T09:00:00Z"), new Date("2026-10-01T09:00:00Z")], NOW, 7);
    expect(signups.at(-1)).toEqual({ day: "2026-11-04", value: 2 });
    expect(signups.reduce((sum, p) => sum + p.value, 0)).toBe(2);
  });

  it("temps actif moyen par utilisateur actif", () => {
    expect(averageActiveSeconds(rows, lastDays(NOW, 7))).toBe(Math.round((600 + 89 + 120) / 3));
    expect(averageActiveSeconds([], lastDays(NOW, 7))).toBe(0);
  });

  it("rétention : inscrits depuis 7 jours revenus au moins une fois à partir de J+1", () => {
    const users = [
      { id: "a", createdAt: new Date(NOW.getTime() - 10 * DAY) },
      { id: "b", createdAt: new Date(NOW.getTime() - 8 * DAY) },
      { id: "c", createdAt: new Date(NOW.getTime() - 2 * DAY) },
    ];
    const activity = [
      { userId: "a", day: utcDay(new Date(NOW.getTime() - 10 * DAY)), activeSeconds: 100 },
      { userId: "a", day: utcDay(new Date(NOW.getTime() - 5 * DAY)), activeSeconds: 100 },
      { userId: "b", day: utcDay(new Date(NOW.getTime() - 8 * DAY)), activeSeconds: 100 },
    ];
    expect(retention(users, activity, NOW)).toEqual({ cohort: 2, returned: 1, rate: 0.5 });
    expect(retention([], [], NOW).rate).toBeNull();
  });

  it("session active = non expirée", () => {
    expect(isSessionActive(new Date(NOW.getTime() + 1), NOW)).toBe(true);
    expect(isSessionActive(NOW, NOW)).toBe(false);
  });
});
