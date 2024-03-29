<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Variant extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];


    public function variant_item(){
        return $this->hasMany(VariantItem::class,'variant_id','id');
    }
}
