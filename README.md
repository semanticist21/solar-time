# solar-time

Calculate local solar time with ±30 second accuracy using Spencer's Equation.

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
- [Usage](#usage)
- [API](#api)
- [License](#license)

## Installation

```sh
npm install solar-time
yarn add solar-time
pnpm add solar-time
```

## Overview

This library calculates local solar time (apparent solar time) based on geographical location and date. Solar time represents the actual position of the sun in the sky, accounting for Earth's elliptical orbit and axial tilt.

**Use cases:** Astronomy, navigation, solar energy systems, sun-based calculations.

**Accuracy:** ±30 seconds using Spencer's Equation (vs ±2 minutes for simplified approximations).

## Usage

```typescript
import {getCurrentSolarTime, getSolarTime, getSunPosition} from "solar-time";

// Current solar time
const now = getCurrentSolarTime(-122.4194); // San Francisco
console.log(now.LST.toISOString()); // Date object
console.log(now.declination); // Solar declination: -14.51°

// Specific date
const result = getSolarTime(new Date("2024-06-21"), 127.5);
console.log(result.TC); // Time correction in minutes

// With UTC offset and precision
const tokyo = getSolarTime(Date.now(), 139.6917, {utcOffset: 9, precision: 2});

// Sun position (sunrise, sunset, azimuth, elevation)
const position = getSunPosition(
  new Date("2025-11-01"),
  -98.583, // longitude
  39.833, // latitude
  {utcOffset: -5}
);

console.log(position.sunrise?.toISOString()); // 2025-11-01T13:04:00Z (08:04 EST)
console.log(position.sunset?.toISOString()); // 2025-11-01T23:32:00Z (18:32 EST)
console.log(position.solarNoon.toISOString()); // When sun is highest
console.log(position.azimuth); // 180° (south at noon in northern hemisphere)
console.log(position.elevation); // Angle above horizon
```

## API

### `getSolarTime(date, longitude, options?)`

Calculate solar time for a specific date and location.

**Parameters:**

- `date`: `Date | string | number` - Date to calculate
- `longitude`: `number` - Location longitude in degrees (-180 to 180)
- `options?`: `SolarTimeOptions`
  - `utcOffset?`: `number` - UTC offset in hours (e.g., -8 for PST, +9 for JST)
  - `precision?`: `number` - Decimal places to round TC value (e.g., 2 for 12.34)

**Returns:** `SolarTimeResult`

- `LST`: `Date` - Local Solar Time
- `TC`: `number` - Time correction (minutes)
- `EoT`: `number` - Equation of Time (minutes)
- `B`: `number` - Day angle (degrees)
- `LSTM`: `number` - Local Standard Time Meridian
- `declination`: `number` - Solar declination angle (degrees, -23.45° to +23.45°)

### `getCurrentSolarTime(longitude, options?)`

Calculate solar time for the current moment.

**Parameters:**

- `longitude`: `number` - Location longitude
- `options?`: `SolarTimeOptions`

**Returns:** `SolarTimeResult`

### `getSunPosition(date, longitude, latitude, options?)`

Calculate sun position including sunrise, sunset, azimuth, and elevation.

Uses NOAA Solar Position formulas with atmospheric refraction correction (0.833°).

**Parameters:**

- `date`: `Date | string | number` - Date to calculate
- `longitude`: `number` - Location longitude in degrees (-180 to 180, positive = East)
- `latitude`: `number` - Location latitude in degrees (-90 to 90, positive = North)
- `options?`: `SolarTimeOptions`

**Returns:** `SunPositionResult`

- `sunrise`: `Date | null` - Sunrise time (null if sun doesn't rise)
- `sunset`: `Date | null` - Sunset time (null if sun doesn't set)
- `solarNoon`: `Date` - Solar noon (when sun is highest)
- `azimuth`: `number` - Solar azimuth angle in degrees (0° = North, 90° = East, 180° = South, 270° = West)
- `elevation`: `number` - Solar elevation angle in degrees above horizon (-90° to +90°)
- `zenith`: `number` - Solar zenith angle in degrees from vertical (0° to 180°)

**Note:** In polar regions during polar night/day, sunrise/sunset may be null. Azimuth and elevation are calculated for the given time regardless of whether the sun is above the horizon.

## License

This project is licensed under the MIT License.
