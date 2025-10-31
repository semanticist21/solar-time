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
import { getSolarTime, getCurrentSolarTime } from "solar-time";

// Current solar time
const now = getCurrentSolarTime(-122.4194); // San Francisco
console.log(now.LST.format("HH:mm:ss"));

// Specific date
const result = getSolarTime(new Date("2024-06-21"), 127.5);
console.log(result.TC); // Time correction in minutes

// With UTC offset
const tokyo = getSolarTime(Date.now(), 139.6917, { utcOffset: 9 });

// Flexible date input
getSolarTime(new Date(), -122.4194);          // Date object
getSolarTime("2024-06-21T12:00:00Z", 127.5);  // ISO string
getSolarTime(Date.now(), 0);                   // Timestamp
```

## API

### `getSolarTime(date, longitude, options?)`

Calculate solar time for a specific date and location.

**Parameters:**

- `date`: `Date | string | number` - Date to calculate
- `longitude`: `number` - Location longitude in degrees (-180 to 180)
- `options?`: `SolarTimeOptions`
  - `utcOffset?`: `number` - UTC offset in hours (e.g., -8 for PST, +9 for JST)

**Returns:** `SolarTimeResult`

- `LST`: `Dayjs` - Local Solar Time
- `TC`: `number` - Time correction (minutes)
- `EoT`: `number` - Equation of Time (minutes)
- `B`: `number` - Day angle (degrees)
- `LSTM`: `number` - Local Standard Time Meridian

### `getCurrentSolarTime(longitude, options?)`

Calculate solar time for the current moment.

**Parameters:**

- `longitude`: `number` - Location longitude
- `options?`: `SolarTimeOptions`

**Returns:** `SolarTimeResult`

## License

This project is licensed under the MIT License.
