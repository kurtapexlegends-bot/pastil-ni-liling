<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteSetting extends Model
{
    protected $fillable = [
        'key',
        'value'
    ];

    /**
     * Get a website setting by key.
     * Automatically handles JSON decoding if applicable, otherwise returns raw/fallback value.
     */
    public static function getByKey(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        $value = $setting->value;

        // Automatically decode JSON arrays/objects
        if (is_string($value) && (
            (str_starts_with($value, '[') && str_ends_with($value, ']')) ||
            (str_starts_with($value, '{') && str_ends_with($value, '}'))
        )) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }

        return $value;
    }

    /**
     * Set a website setting by key.
     * Automatically converts arrays/objects into JSON.
     */
    public static function setByKey(string $key, mixed $value): self
    {
        $valueToStore = (is_array($value) || is_object($value)) 
            ? json_encode($value, JSON_UNESCAPED_UNICODE) 
            : $value;

        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $valueToStore]
        );
    }
}
