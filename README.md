# Config

## Usage

Install package:

```bash
pnpm add @fethcat/config
```

Use module:

```typescript
import { ConfigService } from '@fethcat/config'

async function fetch() {
  return 'list promise'
}

export const list = new ConfigService<string>(9000, fetch)

void list.getConfig()
```
