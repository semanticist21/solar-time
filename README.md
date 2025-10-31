# solar-time

A TypeScript library for calculating local solar time with improved accuracy using Spencer's Equation.

## Table of Contents

- [solar-time](#solar-time)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [License](#license)

## Installation

```sh
npm install solar-time

yarn add solar-time

pnpm add solar-time

```

## Usage

This library provides functions to calculate solar time, also known as local apparent time, based on a given location and date.

Solar time is important for various applications such as astronomy, navigation, and solar energy systems.

By using this library, you can accurately determine the position of the sun in the sky for any given time and place, accounting for factors such as the Earth's elliptical orbit and axial tilt.
This is crucial for tasks that require precise solar positioning, such as optimizing solar panel orientation, planning astronomical observations, or navigating by the sun.

**Accuracy:** This library uses Spencer's Equation for calculating the Equation of Time (EoT), providing accuracy within ±30 seconds, which is significantly better than simplified approximations (±2 minutes).

```typescript
import { Solar, SolarNow } from "solar-time";

const date = new Date();
const longitude = -122.4194; // Longitude for San Francisco, CA

// Calculate solar time for a specific date
const solarTime = Solar(date, longitude);
console.log(solarTime);
// Output: { LST: Dayjs, TC: number, EoT: number, B: number, LSTM: number }
console.log(solarTime.LST); // Local solar time as a Dayjs object
console.log(solarTime.TC);  // Time correction in minutes

// Calculate solar time for the current moment
const solarTimeNow = SolarNow(longitude);
console.log(solarTimeNow); // Current local solar time and related calculations

// With custom UTC offset
const solarTimeCustom = Solar(date, longitude, { utc: -8 });
console.log(solarTimeCustom);
```

**Return Values:**
- `LST` (Local Solar Time): Dayjs object adjusted for solar time
- `TC` (Time Correction): Minutes to adjust from standard time to solar time
- `EoT` (Equation of Time): Earth's orbit eccentricity correction in minutes
- `B` (Day Angle): Position in Earth's orbit in degrees
- `LSTM` (Local Standard Time Meridian): Reference longitude for time zone

## License

This project is licensed under the MIT License.
