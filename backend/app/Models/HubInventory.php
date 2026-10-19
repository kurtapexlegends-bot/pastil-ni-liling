<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HubInventory extends Model
{
    use HasFactory, InvalidatesAnalyticsCache;

    protected $fillable = [
        'hub_id',
        'product_id',
        'stock_quantity',
    ];

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
