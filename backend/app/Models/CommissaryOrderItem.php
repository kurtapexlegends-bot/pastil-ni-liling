<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\InvalidatesAnalyticsCache;

class CommissaryOrderItem extends Model
{
    use HasFactory, InvalidatesAnalyticsCache;

    protected $fillable = [
        'commissary_order_id',
        'product_id',
        'quantity',
        'wholesale_price',
        'subtotal',
    ];

    protected $casts = [
        'wholesale_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(CommissaryOrder::class, 'commissary_order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
