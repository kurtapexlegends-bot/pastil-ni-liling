<?php

namespace App\Traits;

use App\Models\Hub;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * @mixin Model
 *
 * @method static void saved(\Closure|string $callback)
 * @method static void deleted(\Closure|string $callback)
 */
trait InvalidatesAnalyticsCache
{
    /**
     * Boot the trait to listen for eloquent events.
     */
    protected static function bootInvalidatesAnalyticsCache()
    {
        static::saved(function ($model) {
            Cache::forget('analytics_summary');
            if ($model instanceof Product) {
                Cache::forget('active_catalog');
            }
            if ($model instanceof Hub) {
                Cache::forget('active_hubs');
            }
        });

        static::deleted(function ($model) {
            Cache::forget('analytics_summary');
            if ($model instanceof Product) {
                Cache::forget('active_catalog');
            }
            if ($model instanceof Hub) {
                Cache::forget('active_hubs');
            }
        });
    }
}
