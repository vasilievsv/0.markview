# Code Highlighting Test

## TypeScript

```typescript
interface Config {
  enabled: boolean;
  timeout: number;
  name: string;
}

function createConfig(partial: Partial<Config>): Config {
  return {
    enabled: true,
    timeout: 5000,
    name: 'default',
    ...partial
  };
}

const cfg = createConfig({ timeout: 3000 });
console.log(cfg);
```

## Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Device:
    id: int
    name: str
    firmware: Optional[str] = None

    def update(self, fw: str) -> bool:
        self.firmware = fw
        return True

devices = [Device(1, "ECU"), Device(2, "MCU")]
for d in devices:
    print(f"{d.name}: {d.firmware or 'N/A'}")
```

## JSON

```json
{
  "version": "1.0",
  "modules": [
    { "name": "canfd", "status": "active" },
    { "name": "pki", "status": "pending" }
  ]
}
```

## Inline

Use `npm run compile` to build, then `F5` to launch.
