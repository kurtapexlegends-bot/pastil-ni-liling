<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryBatch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'batch_number',
        'product_id',
        'hub_id',
        'quantity',
        'initial_quantity',
        'manufacture_date',
        'expiry_date',
        'discount_triggered',
    ];

    protected $casts = [
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
        'discount_triggered' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }
}
