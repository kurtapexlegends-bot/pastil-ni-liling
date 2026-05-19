<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hub extends Model
{
    use HasFactory;

    protected $fillable = [
        'franchisee_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'status',
    ];

    public function franchisee()
    {
        return $this->belongsTo(User::class, 'franchisee_id');
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
