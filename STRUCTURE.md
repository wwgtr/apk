# Stormhaven Arena — البنية

ينفصل إطار العرض عن منطق اللعبة. يحتفظ React بصفحة كاملة وطبقة HUD فقط، بينما يدير Babylon.js المشهد والحلقة الرسومية. يتكون منطق اللعبة من كائنات مستقلة: `GameWorld` و`PlayerController` و`BotManager` و`ProjectileManager` و`StormManager`.

```text
React shell / CSS HUD
        ↓
GameCanvas lifecycle
        ↓
Babylon Scene → GameWorld
                ├─ PlayerController
                ├─ BotManager
                ├─ ProjectileManager
                └─ StormManager
```
