# solar-time

Calculate local solar time and sun position with ±30 second accuracy using Spencer's Equation and NOAA formulas.

## Installation

```sh
npm install solar-time
```

## Usage

```typescript
import {getSolarTime, getSunPosition} from "solar-time";

// Solar time calculation
const solar = getSolarTime("2024-06-21T12:00:00Z", 127.5);
console.log(solar.LST);         // Local Solar Time (Date)
console.log(solar.TC);          // Time correction (minutes)
console.log(solar.declination); // Solar declination (degrees)

// Sun position (sunrise, sunset, azimuth, elevation)
const sun = getSunPosition("2025-11-01T00:00:00-05:00", -98.583, 39.833);
console.log(sun.sunrise);   // 2025-11-01T13:04:00.000Z
console.log(sun.sunset);    // 2025-11-01T23:32:00.000Z
console.log(sun.azimuth);   // 180° (south at noon)
console.log(sun.elevation); // Angle above horizon
```

**Timezone handling**: Pass ISO strings with timezone info (e.g., `"2025-11-01T09:00:00+09:00"`) and it will be automatically parsed. The `utcOffset` option is only needed when using Date objects or timestamps.

## API

### `getSolarTime(date, longitude, options?)`

Returns: `{LST: Date, TC: number, EoT: number, B: number, LSTM: number, declination: number}`

- `date`: Date, ISO string, or timestamp
- `longitude`: Degrees (-180 to 180)
- `options.utcOffset`: Hours (auto-detected from ISO strings)
- `options.precision`: Decimal places for TC

### `getSunPosition(date, longitude, latitude, options?)`

Returns: `{sunrise: Date | null, sunset: Date | null, solarNoon: Date, azimuth: number, elevation: number, zenith: number}`

- `date`: Date, ISO string, or timestamp
- `longitude`: Degrees (-180 to 180, + = East)
- `latitude`: Degrees (-90 to 90, + = North)
- `options.utcOffset`: Hours (auto-detected from ISO strings)

**Note**: Sunrise/sunset are null in polar regions (polar night/midnight sun).

## License

This project is licensed under the MIT License.
