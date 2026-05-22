<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\InvalidatesAnalyticsCache;

class Product extends Model
{
    use HasFactory;
    use InvalidatesAnalyticsCache;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'wholesale_price',
        'category',
        'image_url',
        'stock',
        'is_active',
        'is_wholesale',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_wholesale' => 'boolean',
        'stock' => 'integer',
    ];
}
