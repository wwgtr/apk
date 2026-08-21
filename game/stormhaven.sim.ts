import gameplay from "./stormhaven.config.json";
import type { Bot, GameSnapshot, InputState, Projectile, Vec2 } from "./stormhaven.types";

const world = gameplay.world;
const match = gameplay.match;
const playerSettings = gameplay.player;
const botSettings = gameplay.bot;
const weapon = gameplay.weapon;

let projectileId = 1;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distance = (first: Vec2, second: Vec2) => Math.hypot(first.x - second.x, first.y - second.y);

function seededPosition(index: number): Vec2 {
  const angle = (index * 2.39996) % (Math.PI * 2);
  const radius = 175 + (index % 3) * 74;
  return { x: world.width / 2 + Math.cos(angle) * radius, y: world.height / 2 + Math.sin(angle) * radius };
}

function createBots(): Bot[] {
  return Array.from({ length: match.botCount }, (_, index) => {
    const position = seededPosition(index + 1);
    return { id: index + 1, ...position, health: botSettings.health, heading: index * 0.82, alive: true };
  });
}

export function createMatch(): GameSnapshot {
  projectileId = 1;
  return {
    phase: "playing",
    player: { x: world.width / 2, y: world.height / 2, health: playerSettings.maxHealth, shield: playerSettings.maxShield, ammo: playerSettings.ammo, heading: -Math.PI / 2 },
    bots: createBots(),
    projectiles: [],
    zoneRadius: world.initialZoneRadius,
    timeRemaining: match.durationSeconds,
    kills: 0,
    fps: match.targetFrameRate,
    status: "اهبط في الجزيرة وابقَ داخل العاصفة",
  };
}

export function createLobby(): GameSnapshot {
  return { ...createMatch(), phase: "lobby", status: "ساحة جاهزة — ابدأ المهمة" };
}

export function fireAtNearestBot(snapshot: GameSnapshot): GameSnapshot {
  if (snapshot.phase !== "playing" || snapshot.player.ammo <= 0) return snapshot;
  const target = snapshot.bots.filter((bot) => bot.alive).sort((a, b) => distance(a, snapshot.player) - distance(b, snapshot.player))[0];
  if (!target) return snapshot;
  const angle = Math.atan2(target.y - snapshot.player.y, target.x - snapshot.player.x);
  const projectile: Projectile = {
    id: projectileId++, x: snapshot.player.x + Math.cos(angle) * 18, y: snapshot.player.y + Math.sin(angle) * 18,
    vx: Math.cos(angle) * weapon.projectileSpeed, vy: Math.sin(angle) * weapon.projectileSpeed, lifetime: 0.9,
  };
  return { ...snapshot, player: { ...snapshot.player, ammo: snapshot.player.ammo - 1, heading: angle }, projectiles: [...snapshot.projectiles, projectile] };
}

export function stepMatch(snapshot: GameSnapshot, input: InputState, deltaSeconds: number, demo = false): GameSnapshot {
  if (snapshot.phase !== "playing") return snapshot;
  const elapsed = Math.min(deltaSeconds, 0.05);
  const timeRemaining = Math.max(0, snapshot.timeRemaining - elapsed);
  const progress = 1 - timeRemaining / match.durationSeconds;
  const zoneRadius = world.initialZoneRadius - (world.initialZoneRadius - world.finalZoneRadius) * progress;
  const playerInput = demo ? { x: Math.cos((match.durationSeconds - snapshot.timeRemaining) * 0.7), y: Math.sin((match.durationSeconds - snapshot.timeRemaining) * 0.9) } : input;
  const magnitude = Math.min(1, Math.hypot(playerInput.x, playerInput.y));
  const normalized = magnitude > 0 ? { x: playerInput.x / magnitude, y: playerInput.y / magnitude } : { x: 0, y: 0 };
  const player = {
    ...snapshot.player,
    x: clamp(snapshot.player.x + normalized.x * playerSettings.speed * elapsed, 28, world.width - 28),
    y: clamp(snapshot.player.y + normalized.y * playerSettings.speed * elapsed, 28, world.height - 28),
    heading: magnitude > 0 ? Math.atan2(normalized.y, normalized.x) : snapshot.player.heading,
  };
  const bots = snapshot.bots.map((bot) => {
    if (!bot.alive) return bot;
    const towardPlayer = Math.atan2(player.y - bot.y, player.x - bot.x);
    const drift = Math.sin((match.durationSeconds - snapshot.timeRemaining) * 1.5 + bot.id) * 0.56;
    const heading = towardPlayer + drift;
    return {
      ...bot,
      heading,
      x: clamp(bot.x + Math.cos(heading) * botSettings.speed * elapsed, 20, world.width - 20),
      y: clamp(bot.y + Math.sin(heading) * botSettings.speed * elapsed, 20, world.height - 20),
    };
  });
  let kills = snapshot.kills;
  const nextProjectiles = snapshot.projectiles.flatMap((shot) => {
    const moved = { ...shot, x: shot.x + shot.vx * elapsed, y: shot.y + shot.vy * elapsed, lifetime: shot.lifetime - elapsed };
    const hit = bots.find((bot) => bot.alive && distance(bot, moved) < 22);
    if (hit) {
      hit.health -= weapon.damage;
      if (hit.health <= 0) { hit.alive = false; kills += 1; }
      return [];
    }
    return moved.lifetime > 0 ? [moved] : [];
  });
  const aliveBots = bots.filter((bot) => bot.alive);
  const center = { x: world.width / 2, y: world.height / 2 };
  const playerDistance = distance(player, center);
  const nearbyBots = aliveBots.filter((bot) => distance(bot, player) < 34).length;
  let damage = nearbyBots * botSettings.touchDamagePerSecond * elapsed;
  if (playerDistance > zoneRadius) damage += 17 * elapsed;
  if (damage > 0) {
    const shieldLoss = Math.min(player.shield, damage);
    player.shield -= shieldLoss;
    player.health = Math.max(0, player.health - (damage - shieldLoss));
  }
  let phase: GameSnapshot["phase"] = snapshot.phase;
  let status = `العاصفة تتقلص · بقي ${aliveBots.length + 1} لاعبين`;
  if (player.health <= 0 || timeRemaining <= 0) { phase = "defeat"; status = "انتهت المهمة — حاول مسارًا مختلفًا"; }
  if (aliveBots.length === 0 && player.health > 0) { phase = "victory"; status = "نجوت من العاصفة — فوز!"; }
  return { ...snapshot, phase, player, bots, projectiles: nextProjectiles, zoneRadius, timeRemaining, kills, status };
}

export const STORMHAVEN_WORLD = world;
export const TARGET_FPS = match.targetFrameRate;
