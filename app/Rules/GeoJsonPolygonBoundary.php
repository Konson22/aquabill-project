<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates a GeoJSON Polygon suitable for a zone outline (closed ring in WGS84).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7946
 */
class GeoJsonPolygonBoundary implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null) {
            return;
        }

        if (! is_array($value)) {
            $fail('The :attribute must be a GeoJSON object.');

            return;
        }

        if (($value['type'] ?? null) !== 'Polygon') {
            $fail('The zone boundary must be a GeoJSON Polygon.');

            return;
        }

        $coordinates = $value['coordinates'] ?? null;
        if (! is_array($coordinates) || $coordinates === []) {
            $fail('The zone boundary polygon must include coordinates.');

            return;
        }

        $exterior = $coordinates[0] ?? null;
        if (! is_array($exterior) || count($exterior) < 4) {
            $fail('The zone boundary ring needs at least three corners (four positions including the closing point).');

            return;
        }

        foreach ($exterior as $i => $position) {
            if (! is_array($position) || count($position) < 2) {
                $fail("Invalid position at index {$i} in the zone boundary.");

                return;
            }
            [$lng, $lat] = $position;
            if (! is_numeric($lng) || ! is_numeric($lat)) {
                $fail('Each boundary position must be numeric longitude and latitude.');

                return;
            }
            $lng = (float) $lng;
            $lat = (float) $lat;
            if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
                $fail('Boundary coordinates must be within valid WGS84 ranges.');

                return;
            }
        }

        $first = $exterior[0];
        $last = $exterior[count($exterior) - 1];
        if (abs((float) $first[0] - (float) $last[0]) > 1e-5 || abs((float) $first[1] - (float) $last[1]) > 1e-5) {
            $fail('The polygon ring must be closed (first and last coordinates must match).');

            return;
        }
    }
}
