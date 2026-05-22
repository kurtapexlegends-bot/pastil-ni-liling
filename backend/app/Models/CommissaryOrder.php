<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\InvalidatesAnalyticsCache;

class CommissaryOrder extends Model
{
    use HasFactory, SoftDeletes, InvalidatesAnalyticsCache;

    protected $fillable = [
        'idempotency_key',
        'user_id',
        'hub_id',
        'total_amount',
        'status',
        'shipping_address',
        'contact_number',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(CommissaryOrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }
}
