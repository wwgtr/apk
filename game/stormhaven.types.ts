export type Vec2 = { x: number; y: number };

export type Bot = Vec2 & {
  id: number;
  health: number;
  heading: number;
  alive: boolean;
};

export type Projectile = Vec2 & {
  id: number;
  vx: number;
  vy: number;
  lifetime: number;
};

export type MatchPhase = "lobby" | "playing" | "victory" | "defeat";

export type GameSnapshot = {
  phase: MatchPhase;
  player: Vec2 & { health: number; shield: number; ammo: number; heading: number };
  bots: Bot[];
  projectiles: Projectile[];
  zoneRadius: number;
  timeRemaining: number;
  kills: number;
  fps: number;
  status: string;
};

export type InputState = {
  x: number;
  y: number;
};
