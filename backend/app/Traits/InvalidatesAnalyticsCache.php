<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

/**
 * @mixin \Illuminate\Database\Eloquent\Model
 * @method static void saved(\Closure|string $callback)
 * @method static void deleted(\Closure|string $callback)
 */
trait InvalidatesAnalyticsCache
{
    /**
     * Boot the trait to listen for eloquent events.
     */
    protected static function bootedInvalidatesAnalyticsCache()
    {
        static::saved(function ($model) {
            Cache::forget('analytics_summary');
        });

        static::deleted(function ($model) {
            Cache::forget('analytics_summary');
        });
    }
}
