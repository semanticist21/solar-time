# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **zero-dependency** TypeScript library for calculating local solar time and sun position with ±30 second accuracy using Spencer's Equation and NOAA formulas. All calculations use native JavaScript Date API without external dependencies.

## Development Commands

**Package Manager**: This project uses `pnpm` (version 10.20.0+)

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the library (creates dist/ with ES and CJS formats)
pnpm build

# Linting and formatting (using Biome)
pnpm run format        # Format code
pnpm run format:check  # Check formatting
pnpm run lint          # Lint code
pnpm run lint:fix      # Lint and auto-fix
pnpm run check         # Run all checks (format + lint)
pnpm run check:fix     # Run all checks and auto-fix

# Full publish workflow (check, test, build, publish)
pnpm run publish-prod
```

**Build System:**
- **Vite** with Rollup for bundling
- Outputs: ES modules (`dist/index.js`) and CommonJS (`dist/index.cjs`)
- TypeScript declarations automatically generated
- Path alias: `@/*` maps to `./src/*`

**Code Quality:**
- **Biome** for formatting and linting (not ESLint/Prettier)
- Formatting: 2 spaces, line width 100, double quotes, semicolons required
- Linting: `useImportType` enforced for type-only imports
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`

## Architecture

**Module Structure:**
```
src/
├── index.ts           # Public API exports
├── types.ts           # TypeScript interfaces for all public types
├── solar.ts           # Core solar time calculations (Spencer's Equation)
├── sun-position.ts    # Sun position calculations (NOAA formulas)
└── utils/
    └── date.ts        # Native Date API utilities (no external dependencies)
```

### Core Calculation Flow

**Solar Time** (`solar.ts`):
1. Accepts Date object, ISO 8601 string, or timestamp
2. Extracts UTC offset from ISO string or uses provided `utcOffset` option
3. Calculates **LSTM** (Local Standard Time Meridian) = `15 * utcOffset` (preserves sign)
4. Computes day-of-year using UTC date components
5. Applies Spencer's Equation for **EoT** (Equation of Time) and **declination**
6. Returns **TC** (Time Correction) = `4 * (longitude - LSTM) + EoT`
7. Returns **LST** as ISO 8601 string preserving original timezone

**Sun Position** (`sun-position.ts`):
1. Gets solar time from `solar.ts` (TC, EoT, declination)
2. Calculates sunrise/sunset using NOAA horizon angle (90.833° with refraction)
3. Computes solar noon based on longitude and EoT
4. Calculates current azimuth and elevation using hour angle
5. Returns all times as ISO 8601 strings (null for polar regions with no sunrise/sunset)

### Timezone Handling (Critical)

**ISO 8601 Strings with Timezone:**
- When ISO string has timezone (e.g., `2025-11-01T09:00:00+09:00`), it's automatically extracted and preserved
- All return values are ISO 8601 strings with the **same timezone** as input
- `addMinutes()` preserves timezone by using optional `timezoneOffset` parameter

**Date Objects and Timestamps:**
- Date objects and timestamps **do not contain timezone information** (only store UTC timestamp)
- `getUTCOffset(new Date())` returns **0** (not system timezone!)
- Users **must** provide explicit `utcOffset` option for non-UTC timezones
- Without `utcOffset`, Date/timestamp inputs are treated as **UTC (offset = 0)**

**UTC Offset Sign Convention:**
- Positive offset = East of GMT (e.g., +9 for Tokyo)
- Negative offset = West of GMT (e.g., -5 for EST)
- LSTM preserves sign: UTC-5 → LSTM = -75° (75°W)

### Date Utility Functions (`utils/date.ts`)

All utilities support Date objects, ISO strings, and timestamps:

- `getDayOfYear(date)`: Returns 1-365/366 based on **UTC date components**
- `getUTCOffset(date)`: Returns offset from ISO string (e.g., "+09:00" → 9), or 0 for Date/timestamp
- `getUTCMidnight(date)`: Returns UTC midnight of the **local date** (accounts for timezone)
- `getLocalTimeInMinutes(date)`: Returns local time-of-day in minutes (0-1440)
- `addMinutes(date, minutes, timezoneOffset?)`: Adds minutes and returns ISO 8601 string **preserving timezone**
- `toDate(date)`: Converts any input to Date object
- `formatWithTimezone(date, offsetHours)`: Internal helper for ISO 8601 formatting with timezone

**Critical:** `getUTCMidnight` must use the **local date**, not UTC date. For example:
- Input: `2025-11-01T20:00:00-05:00` (Nov 1, 8 PM EST)
- UTC time: Nov 2, 1:00 AM
- Correct: Returns UTC midnight of **Nov 1** (the local date)
- Wrong: Returning UTC midnight of Nov 2 causes sunset to be calculated for wrong day

## Testing

**Test Framework:** Vitest (not Jest)
- Test file: `src/index.test.ts` (22 tests)
- Test environment: Node.js
- Uses real NOAA calculator values for validation

**Key Test Data:**
- Kansas location: 39.833°N, -98.583°W
- Multiple timezone tests: EST (-5), KST (+9), Dubai (+4), UTC+10, JST (+9)
- Tests validate against NOAA with ±1° azimuth, ±0.5° elevation tolerance
- Spencer's Equation EoT tolerance: ±1 minute (NOAA uses more precise algorithms)

**When Adding Tests:**
- Use ISO 8601 strings with explicit timezone
- Verify against NOAA Solar Calculator (https://gml.noaa.gov/grad/solcalc/)
- Test sunrise/sunset times with ±3 minute tolerance
- Test declination with ±0.5° tolerance
- Account for Spencer's Equation approximation (±30s accuracy, ±1 min for EoT)

## Code Conventions

**TypeScript:**
- Strict mode with all strict checks enabled
- Use `type` imports: `import type {SolarTimeResult}`
- Path alias: `import {foo} from "@/utils/date"`
- All exported functions require JSDoc with `@param` and `@returns`

**Formatting (Biome):**
- 2 space indentation
- 100 character line width
- Double quotes for strings
- Semicolons required
- No bracket spacing: `{foo}` not `{ foo }`

**Return Value Convention:**
- All date/time values returned as **ISO 8601 strings** (not Date objects)
- Preserves timezone information from input
- Null for impossible values (sunrise/sunset in polar regions)

## Important Notes

**Zero Dependencies:**
- No external libraries allowed (including dayjs)
- Use only native JavaScript Date API
- All date/time utilities in `src/utils/date.ts`

**LSTM Calculation:**
- Must preserve sign: `LSTM = 15 * utcOffset` (never use `Math.abs`)
- Negative offset → negative LSTM (e.g., UTC-5 → LSTM = -75°)

**Mathematical Constants:**
- Spencer's Equation coefficients are fixed (do not modify)
- NOAA horizon angle: 90.833° (includes atmospheric refraction)
- Hour angle: 15° per hour from solar noon
