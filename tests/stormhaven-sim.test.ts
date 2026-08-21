import { describe, expect, it } from "vitest";

import { createMatch, fireAtNearestBot, stepMatch } from "../game/stormhaven.sim";

describe("محاكاة Stormhaven", () => {
  it("تنشئ مباراة قابلة للعب بعدد بوتات وموارد ابتدائية", () => {
    const match = createMatch();
    expect(match.phase).toBe("playing");
    expect(match.bots).toHaveLength(8);
    expect(match.player.health).toBe(100);
    expect(match.player.ammo).toBe(36);
  });

  it("تحرك اللاعب وتقلص منطقة العاصفة مع الزمن", () => {
    const match = createMatch();
    const next = stepMatch(match, { x: 1, y: 0 }, 1);
    expect(next.player.x).toBeGreaterThan(match.player.x);
    expect(next.zoneRadius).toBeLessThan(match.zoneRadius);
    expect(next.timeRemaining).toBeLessThan(match.timeRemaining);
  });

  it("تستهلك الطلقة ذخيرة وتنتج مقذوفًا", () => {
    const match = createMatch();
    const fired = fireAtNearestBot(match);
    expect(fired.player.ammo).toBe(35);
    expect(fired.projectiles).toHaveLength(1);
  });

  it("تحافظ على حالة سليمة خلال 120 خطوة محاكاة قصيرة", () => {
    let match = createMatch();
    for (let frame = 0; frame < 120; frame += 1) {
      match = stepMatch(match, { x: frame % 2 === 0 ? 1 : -1, y: frame % 3 === 0 ? 1 : 0 }, 1 / 120);
      if (frame % 18 === 0) match = fireAtNearestBot(match);
    }
    expect(match.timeRemaining).toBeLessThan(135);
    expect(match.player.health).toBeGreaterThanOrEqual(0);
    expect(match.zoneRadius).toBeLessThan(430);
  });
});
