# solar-time

Calculate local solar time and sun position with ±30 second accuracy using Spencer's Equation and NOAA formulas. **Zero dependencies** - uses only native JavaScript Date API.

## Installation

```sh
npm install solar-time
```

## Usage

```typescript
import {getSolarTime, getSunPosition} from "solar-time";

// Solar time calculation with UTC
const solar = getSolarTime("2024-06-21T12:00:00Z", 127.5);
console.log(solar.LST);         // "2024-06-21T12:08:30.123Z"
console.log(solar.TC);          // Time correction (minutes)
console.log(solar.declination); // Solar declination (degrees)

// Sun position with timezone (EST)
const sun = getSunPosition("2025-11-01T00:00:00-05:00", -98.583, 39.833);
console.log(sun.sunrise);   // "2025-11-01T08:04:12-05:00" (EST timezone preserved)
console.log(sun.sunset);    // "2025-11-01T18:32:45-05:00"
console.log(sun.solarNoon); // "2025-11-01T13:17:52-05:00"
console.log(sun.azimuth);   // 180 (degrees, south at noon)
console.log(sun.elevation); // Angle above horizon (degrees)
```

**Timezone handling**: All returned times preserve the timezone from input ISO strings.

⚠️ **Important**: Date objects and timestamps **do not contain timezone information**.

```typescript
// ✅ ISO string with timezone - automatically detected and preserved
getSolarTime("2025-11-01T09:00:00+09:00", longitude);
// Returns: LST with +09:00 timezone

// ⚠️ Date object - defaults to UTC, provide utcOffset for other timezones
getSolarTime(new Date(), longitude);  // Treated as UTC
getSolarTime(new Date(), longitude, {utcOffset: 9});  // JST (UTC+9)

// ⚠️ Timestamp - defaults to UTC, provide utcOffset for other timezones
getSolarTime(Date.now(), longitude, {utcOffset: -5}); // EST (UTC-5)
```

## API

### `getSolarTime(date, longitude, options?)`

Calculate local solar time using Spencer's Equation.

**Parameters:**
- `date`: `Date | string | number` - Date object, ISO 8601 string, or timestamp
- `longitude`: `number` - Longitude in degrees (-180 to 180, East is positive)
- `options.utcOffset`: `number` - UTC offset in hours (auto-detected from ISO strings, defaults to 0 for Date/timestamp)
- `options.precision`: `number` - Decimal places to round TC value

**Returns:** `SolarTimeResult`
- `LST`: `string` - Local Solar Time as ISO 8601 string (preserves input timezone)
- `TC`: `number` - Time Correction in minutes
- `EoT`: `number` - Equation of Time in minutes
- `B`: `number` - Day angle in degrees
- `LSTM`: `number` - Local Standard Time Meridian in degrees
- `declination`: `number` - Solar declination in degrees (-23.45° to +23.45°)

### `getSunPosition(date, longitude, latitude, options?)`

Calculate sun position using NOAA formulas.

**Parameters:**
- `date`: `Date | string | number` - Date object, ISO 8601 string, or timestamp
- `longitude`: `number` - Longitude in degrees (-180 to 180, East is positive)
- `latitude`: `number` - Latitude in degrees (-90 to 90, North is positive)
- `options.utcOffset`: `number` - UTC offset in hours (auto-detected from ISO strings, defaults to 0 for Date/timestamp)

**Returns:** `SunPositionResult`
- `sunrise`: `string | null` - Sunrise time as ISO 8601 string (null in polar night)
- `sunset`: `string | null` - Sunset time as ISO 8601 string (null in midnight sun)
- `solarNoon`: `string` - Solar noon time as ISO 8601 string (when sun is highest)
- `azimuth`: `number` - Solar azimuth in degrees (0° = North, 90° = East, 180° = South, 270° = West)
- `elevation`: `number` - Solar elevation in degrees above horizon (-90° to +90°)
- `zenith`: `number` - Solar zenith in degrees from vertical (0° to 180°)

## License

This project is licensed under the MIT License.
