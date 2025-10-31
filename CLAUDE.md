# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library for calculating local solar time (also known as local apparent time) based on geographical location and date. The library uses Spencer's Equation for improved accuracy (±30 seconds) and accounts for Earth's elliptical orbit and axial tilt.

**Key Components:**
- **solar.ts**: Core solar time calculations using Spencer's Equation (`getSolarTime`, `getCurrentSolarTime`)
- **types.ts**: TypeScript type definitions (`SolarTimeResult` interface)
- Calculates astronomical values: LST, TC, EoT, B, LSTM with ±30 second accuracy

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

**Single-Module Design:**
The library provides solar time calculations using Spencer's Equation for improved accuracy:

**Core Module** (`solar.ts`):
- Uses native JavaScript `Math` operations
- Spencer's Equation for ±30 second accuracy
- Flexible date input (Date, string, number)
- Options object pattern for extensibility

**Type Definitions** (`types.ts`):
- `SolarTimeOptions`: Configuration interface for calculations
- `SolarTimeResult`: Standardized result structure

**Astronomical Calculations:**
Returns five calculated values:
- **LST** (Local Solar Time): Dayjs object adjusted for solar time
- **TC** (Time Correction): minutes to adjust from standard time to solar time
- **EoT** (Equation of Time): Earth's orbit eccentricity correction in minutes
- **B** (Day Angle): position in Earth's orbit in degrees
- **LSTM** (Local Standard Time Meridian): reference longitude for time zone

**Peer Dependencies:**
The library requires `dayjs` to be installed by the consuming application. Ensure compatibility when making changes.

## Code Conventions

- TypeScript with strict mode enabled (`strict: true`)
- ES2020 target with ESNext modules
- Path imports use `@/` prefix for src directory
- JSDoc comments required for all exported functions with examples
- Explicit type definitions in `types.ts` for all public interfaces
- Options pattern for extensible function parameters
- Return types explicitly typed with interfaces
