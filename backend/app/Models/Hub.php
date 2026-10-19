<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hub extends Model
{
    use HasFactory, InvalidatesAnalyticsCache, SoftDeletes;

    protected $fillable = [
        'franchisee_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'status',
    ];

    public function franchisee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'franchisee_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function inventory()
    {
        return $this->hasMany(HubInventory::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
