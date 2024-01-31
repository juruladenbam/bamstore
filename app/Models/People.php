<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class People extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];


    public function order(){
        return $this->hasMany(Order::class,'people_id','id');
    }

    public function qobilah(){
        return $this->belongsTo(Qobilah::class,'qobilah_id','id');
    }
}
