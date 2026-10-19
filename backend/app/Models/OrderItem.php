<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
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
