# TurboStarter Loading UI Component Library

Source: https://github.com/turbostarter/loading-ui
Documentation & Live Demos: https://www.loading-ui.com

This directory contains the complete collection of 48+ copy-paste React loading animations, spinners, rings, and skeletons from `turbostarter/loading-ui`.

## Component Highlights

- **`ring.tsx`**: Lightweight spinning ring loader with SVG linecaps (used in BROSKI checkout).
- **`dots.tsx` / `bouncing-dots.tsx` / `bobbing-dots.tsx`**: Elegant multi-dot bouncing loaders.
- **`pulse.tsx` / `pulse-dot.tsx`**: Subtle glowing pulse loader.
- **`comet-spinner.tsx`**: Trailing gradient comet animation.
- **`skeleton.tsx`**: Shimmering placeholder box for content loading.
- **`text-shimmer.tsx`**: Shimmering gradient text effect.

## How to Use in BROSKI

Import any component into your React files or copy the SVG/CSS:

```tsx
import { Ring } from '../../tools/loading-ui/ring';

<Ring style={{ width: 18, height: 18 }} />
```
