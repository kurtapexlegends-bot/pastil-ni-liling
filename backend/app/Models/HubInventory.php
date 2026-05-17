<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HubInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'hub_id',
        'product_id',
        'stock_quantity',
    ];

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
