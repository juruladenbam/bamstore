<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberDataPool extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'name',
        'phone_number',
        'qobilah',
        'order_count'
    ];
}
