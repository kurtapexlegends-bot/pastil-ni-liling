<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosSyncAnomaly extends Model
{
    use HasFactory;

    protected $table = 'pos_sync_anomalies';

    protected $fillable = [
        'hub_id',
        'product_id',
        'expected_stock',
        'actual_stock',
        'discrepancy_amount',
        'status',
        'notes',
    ];

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }

    public function product()
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

        return $query->where('id', -1); // Deny access
    }
}
