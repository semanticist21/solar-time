# solar-time

Calculate local solar time and sun position using Spencer's Equation and NOAA formulas. **Zero dependencies** - uses only native JavaScript Date API.

**Accuracy**: ±30 seconds for solar time calculations, ±1-3 minutes for sunrise/sunset times (due to Spencer's Equation approximation vs NOAA's more precise algorithms).

## Use Cases

- ☀️ **Solar panel optimization** - Calculate optimal panel angles and solar tracking
- 🌅 **Sunrise/sunset times** - Accurate astronomical event timing
- 📷 **Photography planning** - Golden hour and sun position for shoots
- 🏗️ **Architecture & construction** - Shadow analysis and solar exposure
- 🌾 **Agriculture** - Daylight planning and solar radiation modeling
- 🔭 **Astronomy** - Solar position calculations and sundial corrections

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

// Sun position with timezone (EST) - Note: latitude, longitude order
const sun = getSunPosition("2025-11-01T00:00:00-05:00", 39.833, -98.583);
console.log(sun.sunrise);   // "2025-11-01T08:04:12-05:00" (EST timezone preserved)
console.log(sun.sunset);    // "2025-11-01T18:32:45-05:00"
console.log(sun.solarNoon); // "2025-11-01T13:17:52-05:00"
console.log(sun.azimuth);   // 180 (degrees, south at noon)
console.log(sun.elevation); // Angle above horizon (degrees)
```

**Timezone handling**: Only ISO 8601 strings with timezone are accepted. All returned times preserve the input timezone.

```typescript
// ✅ ISO string with timezone
getSolarTime("2025-11-01T09:00:00+09:00", longitude);  // JST
getSolarTime("2025-11-01T09:00:00Z", longitude);       // UTC
getSolarTime("2025-11-01T09:00:00-05:00", longitude);  // EST
```

## API

### `getSolarTime(isoDateTime, longitude)`

Calculate local solar time using Spencer's Equation.

**Parameters:**

- `isoDateTime`: `string` - ISO 8601 string with timezone (e.g., "2025-11-01T09:00:00+09:00")
- `longitude`: `number` - Longitude in degrees (-180 to 180, + = East, - = West)

**Returns:** `SolarTimeResult`

- `LST`: `string` - Local Solar Time as ISO 8601 string (preserves input timezone)
- `TC`: `number` - Time Correction in minutes
- `EoT`: `number` - Equation of Time in minutes
- `B`: `number` - Day angle in degrees
- `LSTM`: `number` - Local Standard Time Meridian in degrees
- `declination`: `number` - Solar declination in degrees (-23.45° to +23.45°)

### `getSunPosition(isoDateTime, latitude, longitude)`

Calculate sun position using NOAA formulas.

**Parameters:**

- `isoDateTime`: `string` - ISO 8601 string with timezone (e.g., "2025-11-01T09:00:00+09:00")
- `latitude`: `number` - Latitude in degrees (-90 to 90, + = North, - = South)
- `longitude`: `number` - Longitude in degrees (-180 to 180, + = East, - = West)

**Returns:** `SunPositionResult`

- `sunrise`: `string | null` - Sunrise time as ISO 8601 string (null in polar night)
- `sunset`: `string | null` - Sunset time as ISO 8601 string (null in midnight sun)
- `solarNoon`: `string` - Solar noon time as ISO 8601 string (when sun is highest)
- `azimuth`: `number` - Solar azimuth in degrees (0° = North, 90° = East, 180° = South, 270° = West)
- `elevation`: `number` - Solar elevation in degrees above horizon (-90° to +90°)
- `zenith`: `number` - Solar zenith in degrees from vertical (0° to 180°)

## License

This project is licensed under the MIT License.
