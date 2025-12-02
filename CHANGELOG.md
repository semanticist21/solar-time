# Changelog

## [2.1.0] - 2024-12-02

### Changed

- Removed `precision` option - library now returns maximum precision values
- Users can round values themselves using `Math.round()` if needed
- Updated documentation to clarify accuracy: ±30s for solar time, ±1-3min for sunrise/sunset

## [2.0.0] - 2024-12-02

### Breaking Changes

- ISO 8601 string only (removed Date/number types)
- `getSunPosition()` parameter order: `(isoDateTime, latitude, longitude)`
- Removed `utcOffset` option (auto-extracted from ISO string)
- Removed `getCurrentSolarTime()`

### Added

- Input validation (longitude, latitude, ISO format)

## [1.0.0] - 2024-11-30

- Initial release
