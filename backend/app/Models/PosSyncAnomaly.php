<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosSyncAnomaly extends Model
{
    use HasFactory;

    protected $table = 'pos_sync_anomalies';

    protected $fillable = [
        'hub_id',
        'offline_order_id',
        'product_id',
        'requested_quantity',
        'available_quantity',
        'status',
        'notes',
    ];

    protected $casts = [
        'requested_quantity' => 'integer',
        'available_quantity' => 'integer',
    ];

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeForUser($query, $user)
    {
        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            return $query; // Global view
        }

        if ($user->hasRole('Franchisee')) {
            $hubs = Hub::where('franchisee_id', $user->id)->pluck('id');

            return $query->whereIn('hub_id', $hubs);
        }

        if ($user->hasRole('Branch Cashier') && $user->hub_id) {
            return $query->where('hub_id', $user->hub_id);
        }

        return $query->where('id', -1); // Deny access
    }
}
