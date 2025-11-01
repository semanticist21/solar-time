# solar-time

Calculate local solar time and sun position with ±30 second accuracy using Spencer's Equation and NOAA formulas. **Zero dependencies** - uses only native JavaScript Date API.

## Installation

```sh
npm install solar-time
```

## Usage

```typescript
import {getSolarTime, getSunPosition} from "solar-time";

// Solar time calculation
const solar = getSolarTime("2024-06-21T12:00:00Z", 127.5);
console.log(solar.LST);         // "2024-06-21T12:08:30.123Z" (ISO 8601 string)
console.log(solar.TC);          // Time correction (minutes)
console.log(solar.declination); // Solar declination (degrees)

// Sun position (sunrise, sunset, azimuth, elevation)
const sun = getSunPosition("2025-11-01T00:00:00-05:00", -98.583, 39.833);
console.log(sun.sunrise);   // "2025-11-01T13:04:00.000Z"
console.log(sun.sunset);    // "2025-11-01T23:32:00.000Z"
console.log(sun.solarNoon); // "2025-11-01T18:17:52.000Z"
console.log(sun.azimuth);   // 180 (degrees, south at noon)
console.log(sun.elevation); // Angle above horizon (degrees)
```

**Timezone handling**: All date/time values are returned as ISO 8601 strings preserving timezone information.

⚠️ **Important**: JavaScript Date objects **lose timezone information** (only store UTC timestamp). When using Date objects or timestamps, you **must** provide `utcOffset` option explicitly:

```typescript
// ✅ Recommended: ISO string with timezone (auto-parsed)
getSolarTime("2025-11-01T09:00:00+09:00", longitude);

// ⚠️ Date object: MUST provide utcOffset manually
getSolarTime(new Date(), longitude, {utcOffset: 9});  // JST

// ⚠️ Timestamp: MUST provide utcOffset manually
getSolarTime(Date.now(), longitude, {utcOffset: -5}); // EST
```

## API

### `getSolarTime(date, longitude, options?)`

Returns: `{LST: string, TC: number, EoT: number, B: number, LSTM: number, declination: number}`

- `date`: Date, ISO string, or timestamp
- `longitude`: Degrees (-180 to 180)
- `options.utcOffset`: Hours (auto-detected from ISO strings)
- `options.precision`: Decimal places for TC

### `getSunPosition(date, longitude, latitude, options?)`

Returns: `{sunrise: string | null, sunset: string | null, solarNoon: string, azimuth: number, elevation: number, zenith: number}`

- `date`: Date, ISO string, or timestamp
- `longitude`: Degrees (-180 to 180, + = East)
- `latitude`: Degrees (-90 to 90, + = North)
- `options.utcOffset`: Hours (auto-detected from ISO strings)

**Note**: Sunrise/sunset are null in polar regions (polar night/midnight sun). All times are ISO 8601 strings.

## License

This project is licensed under the MIT License.
