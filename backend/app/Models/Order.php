<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, InvalidatesAnalyticsCache, SoftDeletes;

    protected $fillable = [
        'idempotency_key',
        'user_id',
        'hub_id',
        'type',
        'channel',
        'total_amount',
        'status',
        'shipping_address',
        'latitude',
        'longitude',
        'contact_number',
        'payment_method',
        'notes',
        'cashier_id',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
