# solar-time

A simple solar time library.

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

```typescript
import { Solar, SolarNow, SolarPrecise, SolarNowPrecise } from "solar-time";

const date = new Date();
const longitude = -122.4194; // Longitude for San Francisco, CA

// Solar Function
const solarTime = Solar(date, longitude);
console.log(solarTime); // Outputs the local solar time and related calculations
console.log(solarTime.LST); // Outputs the local solar time

// SolarNow Function
const solarTimeNow = SolarNow(longitude);
console.log(solarTimeNow); // Outputs the current local solar time and related calculations

// SolarPrecise Function
const solarPreciseTime = SolarPrecise(date, longitude.toString());
console.log(solarPreciseTime); // Outputs the precise local solar time and related calculations using Decimal.js for higher precision

// SolarNowPrecise Function
const solarPreciseTimeNow = SolarNowPrecise(longitude.toString());
console.log(solarPreciseTimeNow); // Outputs the current precise local solar time and related calculations using Decimal.js for higher precision
```

## License

This project is licensed under the MIT License.
