<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;
    use InvalidatesAnalyticsCache;

    protected $fillable = [
        'name',
        'unit',
        'stock',
        'min_stock',
        'unit_cost',
    ];
}
