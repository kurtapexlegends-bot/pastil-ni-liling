<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, InvalidatesAnalyticsCache, SoftDeletes;

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
