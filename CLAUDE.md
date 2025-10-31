# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library for calculating local solar time (also known as local apparent time) based on geographical location and date. The library accounts for the Earth's elliptical orbit and axial tilt to provide accurate solar positioning calculations.

**Key Components:**
- **solar.ts**: Standard precision calculations using JavaScript `Math` (Solar, SolarNow)
- **solar-precision.ts**: High precision calculations using `Decimal.js` for increased accuracy (SolarPrecise, SolarNowPrecise)
- Both modules calculate the same astronomical values (LST, TC, EoT, B, LSTM) with different precision levels

## Development Commands

**Package Manager**: This project uses `pnpm` (version 10.20.0+)

```bash
# Run tests
pnpm test

# Build the library (creates dist/ with ES and CJS formats)
pnpm build

# Development mode (runs src/index.ts with Bun)
pnpm dev

# Full publish workflow (runs tests, builds, then publishes)
pnpm run publish-prod
```

**Testing:**
- Tests use Jest with ts-jest transformer
- Test files: `src/index.test.ts`
- Test environment: jsdom
- Setup file: `jest.setup.ts` (configured but verify contents before modifying)

**Build System:**
- Uses Vite with Rollup for bundling
- Outputs: ES modules (`dist/index.js`) and CommonJS (`dist/index.cjs`)
- Includes TypeScript declarations
- Path alias: `@/*` maps to `./src/*`

## Architecture

**Two-Module Design Pattern:**
The library provides parallel implementations with different precision levels:

1. **Standard Module** (`solar.ts`):
   - Uses native JavaScript `Math` operations
   - Input: `longitude` as `number`
   - Output: TC as `number`
   - Best for most use cases with acceptable floating-point precision

2. **Precision Module** (`solar-precision.ts`):
   - Uses `Decimal.js` for arbitrary precision arithmetic
   - Input: `longitude` as `string` (to preserve precision)
   - Output: TC as `string` (preserves full precision)
   - Use when maximum precision is required (e.g., scientific applications)

**Astronomical Calculations:**
All functions calculate five values:
- **LST** (Local Solar Time): dayjs object adjusted for solar time
- **TC** (Time Correction): minutes to adjust from standard time to solar time
- **EoT** (Equation of Time): Earth's orbit eccentricity correction in minutes
- **B** (Day Angle): position in Earth's orbit in degrees
- **LSTM** (Local Standard Time Meridian): reference longitude for time zone

**Peer Dependencies:**
The library requires `dayjs` and `decimal.js` to be installed by the consuming application. Ensure compatibility when making changes.

## Code Conventions

- TypeScript with strict mode enabled (`strict: true`)
- ES2020 target with ESNext modules
- Path imports use `@/` prefix for src directory
- JSDoc comments required for all exported functions
- Function parameters document types and descriptions
- Return types specify object structure explicitly
