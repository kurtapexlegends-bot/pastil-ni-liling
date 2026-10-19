<?php

namespace App\Models;

use App\Traits\InvalidatesAnalyticsCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasFactory, InvalidatesAnalyticsCache;

    protected $fillable = [
        'user_id',
        'hub_id',
        'start_date',
        'end_date',
        'base_pay',
        'commission_pay',
        'total_pay',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }
}
