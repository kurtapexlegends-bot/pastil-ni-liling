<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\InvalidatesAnalyticsCache;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;
    use InvalidatesAnalyticsCache;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'flavor_modifier',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
