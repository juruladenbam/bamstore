<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Qobilah extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];


    public function people(){
        return $this->hasMany(People::class,'qobilah_id','id');
    }
}
