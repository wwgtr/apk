import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Line, Rect, Stop } from "react-native-svg";

import { createLobby, createMatch, fireAtNearestBot, stepMatch, STORMHAVEN_WORLD, TARGET_FPS } from "@/game/stormhaven.sim";
import type { GameSnapshot, InputState } from "@/game/stormhaven.types";

const palette = { ink: "#061217", water: "#082D37", sand: "#B79767", stone: "#263C43", teal: "#55E0D7", cyan: "#27AFC6", orange: "#FF8B4D", red: "#F45C63", white: "#F5FEFF", muted: "#8CA5AA" };

function formatTime(value: number): string {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.ceil(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function GameMap({ game }: { game: GameSnapshot }) {
  const alive = game.bots.filter((bot) => bot.alive);
  return (
    <Svg viewBox={`0 0 ${STORMHAVEN_WORLD.width} ${STORMHAVEN_WORLD.height}`} style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="water" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#07323A" /><Stop offset="1" stopColor="#041920" /></LinearGradient>
        <LinearGradient id="island" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#D1B174" /><Stop offset="1" stopColor="#8A6C45" /></LinearGradient>
      </Defs>
      <Rect width={STORMHAVEN_WORLD.width} height={STORMHAVEN_WORLD.height} fill="url(#water)" />
      <Circle cx="500" cy="300" r="455" fill="url(#island)" />
      <Circle cx="500" cy="300" r={game.zoneRadius} fill="none" stroke={palette.teal} strokeWidth="9" strokeDasharray="14 10" opacity={0.78} />
      <Circle cx="500" cy="300" r={game.zoneRadius + 18} fill="none" stroke={palette.cyan} strokeWidth="3" opacity={0.3} />
      <Rect x="208" y="156" width="96" height="50" rx="7" fill="#2D5E67" transform="rotate(-9 256 181)" />
      <Rect x="712" y="364" width="110" height="50" rx="7" fill="#31545B" transform="rotate(12 767 389)" />
      <Circle cx="320" cy="387" r="46" fill="#3C4B44" opacity={0.9} /><Circle cx="692" cy="185" r="38" fill="#3A4942" opacity={0.9} />
      <G opacity={0.95}><Rect x="395" y="224" width="28" height="22" rx="4" fill={palette.orange} /><Line x1="401" y1="235" x2="417" y2="235" stroke={palette.white} strokeWidth="3" /></G>
      <G opacity={0.95}><Rect x="584" y="385" width="28" height="22" rx="4" fill={palette.teal} /><Circle cx="598" cy="396" r="7" fill={palette.white} /></G>
      {alive.map((bot) => <G key={bot.id} transform={`translate(${bot.x} ${bot.y}) rotate(${(bot.heading * 180) / Math.PI + 90})`}><Circle r="16" fill="#1D2A30" stroke={palette.orange} strokeWidth="4" /><Line x1="0" y1="-13" x2="0" y2="-30" stroke={palette.orange} strokeWidth="5" strokeLinecap="round" /><Circle cx="-5" cy="-2" r="2.8" fill={palette.teal} /><Circle cx="5" cy="-2" r="2.8" fill={palette.teal} /></G>)}
      {game.projectiles.map((shot) => <Circle key={shot.id} cx={shot.x} cy={shot.y} r="5" fill={palette.orange} />)}
      <G transform={`translate(${game.player.x} ${game.player.y}) rotate(${(game.player.heading * 180) / Math.PI + 90})`}><Circle r="20" fill="#15252C" stroke={palette.teal} strokeWidth="5" /><Circle cy="-2" r="9" fill="#FF9D52" /><Line x1="0" y1="-16" x2="0" y2="-39" stroke={palette.teal} strokeWidth="7" strokeLinecap="round" /></G>
    </Svg>
  );
}

export function StormhavenGame() {
  const params = useLocalSearchParams<{ demo?: string }>();
  const demo = params.demo === "1" || params.demo === "true";
  const stateRef = useRef<GameSnapshot>(createLobby());
  const inputRef = useRef<InputState>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const fpsSamplesRef = useRef<number[]>([]);
  const [game, setGame] = useState<GameSnapshot>(stateRef.current);

  const start = useCallback(() => {
    stateRef.current = createMatch();
    lastTimeRef.current = null;
    setGame(stateRef.current);
  }, []);

  const shoot = useCallback(() => {
    stateRef.current = fireAtNearestBot(stateRef.current);
    setGame(stateRef.current);
  }, []);

  useEffect(() => {
    if (demo) start();
  }, [demo, start]);

  useEffect(() => {
    const frame = (now: number) => {
      const previous = lastTimeRef.current ?? now;
      const elapsedMs = now - previous;
      lastTimeRef.current = now;
      if (stateRef.current.phase === "playing") {
        const next = stepMatch(stateRef.current, inputRef.current, elapsedMs / 1000, demo);
        const samples = [...fpsSamplesRef.current, elapsedMs > 0 ? 1000 / elapsedMs : TARGET_FPS].slice(-20);
        fpsSamplesRef.current = samples;
        next.fps = Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length);
        stateRef.current = next;
        setGame(next);
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [demo]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const keyDown = (event: KeyboardEvent) => {
      const next = { ...inputRef.current };
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") next.y = -1;
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") next.y = 1;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") next.x = -1;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") next.x = 1;
      if (event.key === " ") shoot();
      inputRef.current = next;
    };
    const keyUp = (event: KeyboardEvent) => {
      const next = { ...inputRef.current };
      if (["ArrowUp", "ArrowDown", "w", "W", "s", "S"].includes(event.key)) next.y = 0;
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) next.x = 0;
      inputRef.current = next;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); };
  }, [shoot]);

  const setDirection = (x: number, y: number) => { inputRef.current = { x, y }; };
  const active = game.phase === "playing";
  const remaining = game.bots.filter((bot) => bot.alive).length + 1;
  const phaseLabel = game.phase === "victory" ? "ناجٍ" : game.phase === "defeat" ? "خارج العاصفة" : "المهمة";

  return (
    <View style={styles.shell}>
      <StatusBar hidden />
      <GameMap game={game} />
      <View pointerEvents="none" style={styles.vignette} />
      <View style={styles.topHud} pointerEvents="box-none">
        <View style={styles.brand}><Text style={styles.brandKicker}>STORMHAVEN / ARENA</Text><Text style={styles.brandTitle}>مرسى العاصفة</Text></View>
        <View style={styles.topRight}><View style={styles.fpsChip}><Text style={styles.fpsValue}>{game.fps || TARGET_FPS}</Text><Text style={styles.fpsLabel}>FPS</Text></View><View style={styles.counterChip}><MaterialIcons name="groups" size={16} color={palette.white} /><Text style={styles.counterText}>{remaining}</Text></View></View>
      </View>
      <View style={styles.statusLine}><View style={styles.statusDot} /><Text style={styles.statusText}>{game.status}</Text></View>
      <View style={styles.bottomHud} pointerEvents="box-none">
        <View style={styles.vitals}><Text style={styles.phase}>{phaseLabel.toUpperCase()}</Text><View style={styles.barTrack}><View style={[styles.healthBar, { width: `${game.player.health}%` }]} /></View><View style={styles.barTrack}><View style={[styles.shieldBar, { width: `${game.player.shield}%` }]} /></View><Text style={styles.vitalText}>صحة {Math.ceil(game.player.health)} · درع {Math.ceil(game.player.shield)}</Text></View>
        <View style={styles.weapon}><Text style={styles.ammo}>{game.player.ammo.toString().padStart(2, "0")}</Text><Text style={styles.weaponType}>طاقة نبضية</Text><Text style={styles.kills}>إقصاءات {game.kills}</Text></View>
      </View>
      {!active && <View style={styles.resultLayer}><View style={styles.resultCard}><Text style={styles.resultEyebrow}>ساحة مصغرة · {TARGET_FPS} هدف</Text><Text style={styles.resultTitle}>{game.phase === "victory" ? "آخر ناجٍ" : game.phase === "defeat" ? "تعذّر النجاة" : "ابدأ الإنزال"}</Text><Text style={styles.resultDescription}>{game.phase === "lobby" ? "تحرك، اجمع الموارد، وأطلق نحو أقرب روبوت. على الويب استخدم WASD أو الأسهم والمسافة." : `سجلت ${game.kills} إقصاء. العاصفة لا تنتظر أحدًا.`}</Text><TouchableOpacity onPress={start} style={styles.startButton}><MaterialIcons name="play-arrow" size={24} color={palette.ink} /><Text style={styles.startText}>{game.phase === "lobby" ? "ابدأ المهمة" : "إعادة الإنزال"}</Text></TouchableOpacity></View></View>}
      {active && <View style={styles.controls}>
        <View style={styles.dpad}><Pressable onPressIn={() => setDirection(0, -1)} onPressOut={() => setDirection(0, 0)} style={[styles.controlButton, styles.up]}><MaterialIcons name="keyboard-arrow-up" size={28} color={palette.white} /></Pressable><Pressable onPressIn={() => setDirection(-1, 0)} onPressOut={() => setDirection(0, 0)} style={[styles.controlButton, styles.left]}><MaterialIcons name="keyboard-arrow-left" size={28} color={palette.white} /></Pressable><Pressable onPressIn={() => setDirection(1, 0)} onPressOut={() => setDirection(0, 0)} style={[styles.controlButton, styles.right]}><MaterialIcons name="keyboard-arrow-right" size={28} color={palette.white} /></Pressable><Pressable onPressIn={() => setDirection(0, 1)} onPressOut={() => setDirection(0, 0)} style={[styles.controlButton, styles.down]}><MaterialIcons name="keyboard-arrow-down" size={28} color={palette.white} /></Pressable></View>
        <TouchableOpacity onPress={shoot} style={styles.fireButton}><MaterialIcons name="bolt" size={31} color={palette.ink} /><Text style={styles.fireText}>إطلاق</Text></TouchableOpacity>
      </View>}
      {active && <View style={styles.timer}><MaterialIcons name="timer" size={16} color={palette.teal} /><Text style={styles.timerText}>{formatTime(game.timeRemaining)}</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: palette.ink, overflow: "hidden", minHeight: 360 },
  vignette: { ...StyleSheet.absoluteFillObject, borderWidth: 18, borderColor: "rgba(0,0,0,0.25)", pointerEvents: "none" },
  topHud: { position: "absolute", top: 18, left: 22, right: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { backgroundColor: "rgba(4, 21, 26, 0.74)", borderWidth: 1, borderColor: "rgba(85,224,215,0.26)", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11 },
  brandKicker: { color: palette.teal, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" }, brandTitle: { color: palette.white, fontSize: 18, fontWeight: "900", marginTop: 1 },
  topRight: { flexDirection: "row", gap: 8 }, fpsChip: { backgroundColor: "rgba(4, 21, 26, 0.74)", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, alignItems: "center" }, fpsValue: { color: palette.teal, fontWeight: "900", fontSize: 15 }, fpsLabel: { color: palette.muted, fontWeight: "800", fontSize: 8, letterSpacing: 0.8 }, counterChip: { backgroundColor: "rgba(4, 21, 26, 0.74)", paddingHorizontal: 12, paddingVertical: 10, gap: 5, borderRadius: 10, flexDirection: "row", alignItems: "center" }, counterText: { color: palette.white, fontWeight: "900", fontSize: 15 },
  statusLine: { position: "absolute", top: 94, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(3, 16, 20, 0.72)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 }, statusDot: { width: 7, height: 7, backgroundColor: palette.orange, borderRadius: 4 }, statusText: { color: palette.white, fontWeight: "700", fontSize: 12 },
  bottomHud: { position: "absolute", bottom: 18, left: 22, right: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }, vitals: { width: 168, backgroundColor: "rgba(4, 21, 26, 0.76)", padding: 10, borderRadius: 12, gap: 5 }, phase: { color: palette.orange, fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, barTrack: { height: 7, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 4, overflow: "hidden" }, healthBar: { height: "100%", backgroundColor: palette.red, borderRadius: 4 }, shieldBar: { height: "100%", backgroundColor: palette.teal, borderRadius: 4 }, vitalText: { color: palette.white, fontSize: 10, fontWeight: "700", marginTop: 1 },
  weapon: { backgroundColor: "rgba(4, 21, 26, 0.76)", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, alignItems: "flex-end" }, ammo: { color: palette.white, fontSize: 28, fontWeight: "900", lineHeight: 29 }, weaponType: { color: palette.teal, fontSize: 10, fontWeight: "800" }, kills: { color: palette.muted, fontSize: 10, marginTop: 4, fontWeight: "700" },
  resultLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,11,14,0.62)", alignItems: "center", justifyContent: "center", padding: 22 }, resultCard: { maxWidth: 430, backgroundColor: "rgba(7,28,34,0.96)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(85,224,215,0.38)", padding: 24, alignItems: "center" }, resultEyebrow: { color: palette.teal, fontSize: 11, letterSpacing: 1, fontWeight: "800" }, resultTitle: { color: palette.white, fontSize: 31, fontWeight: "900", marginTop: 7 }, resultDescription: { color: "#C5D7D9", textAlign: "center", lineHeight: 20, fontSize: 13, marginTop: 10, maxWidth: 340 }, startButton: { marginTop: 18, backgroundColor: palette.orange, paddingHorizontal: 22, height: 46, borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 5 }, startText: { color: palette.ink, fontWeight: "900", fontSize: 15 },
  controls: { position: "absolute", left: 22, right: 22, bottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }, dpad: { width: 126, height: 108, position: "relative" }, controlButton: { position: "absolute", width: 43, height: 43, borderRadius: 13, backgroundColor: "rgba(4,21,26,0.82)", borderWidth: 1, borderColor: "rgba(245,254,255,0.25)", alignItems: "center", justifyContent: "center" }, up: { top: 0, left: 42 }, down: { bottom: 0, left: 42 }, left: { bottom: 0, left: 0 }, right: { bottom: 0, right: 0 }, fireButton: { width: 78, height: 78, borderRadius: 39, backgroundColor: palette.orange, borderWidth: 5, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }, fireText: { color: palette.ink, fontWeight: "900", fontSize: 10, marginTop: -2 }, timer: { position: "absolute", right: 22, top: 108, flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "rgba(4, 21, 26, 0.74)", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 }, timerText: { color: palette.white, fontSize: 12, fontWeight: "800" },
});
