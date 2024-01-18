<?php

namespace App\Http\Controllers\Produk;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProdukController extends Controller
{
    private $gambar;
    private $data;
    public function __construct()
    {
        $this->gambar = [
            [
                'id_gambar' => '1',
                'id_data' => '1',
                'gambar' => 'bamstore kaos.jpg',
            ],
            [
                'id_gambar' => '2',
                'id_data' => '1',
                'gambar' => 'bamstore desain kaos.jpg',
            ],
            [
                'id_gambar' => '3',
                'id_data' => '1',
                'gambar' => 'bamstore size chart kaos.jpg',
            ],
            [
                'id_gambar' => '4',
                'id_data' => '2',
                'gambar' => 'bamstore sarung.jpg',
            ],
        ];
        $this->data = [
            [
                'id' => '1',
                'nama' => 'Kaos',
                'bg' => 'default',
                'harga' => 75000
            ],
            [
                'id' => '2',
                'nama' => 'Sarung Batik Pekalongan',
                'bg' => 'secondary',
                'harga' => 90000
            ],
        ];
    }
    public function main() {
        $gambar = $this->gambar;
        $data = $this->data;
        return view('produk.main',compact('data','gambar'));
    }
    public function detail($id) {
        $gambar = [];
        $data = [];
        foreach($this->data as $item){
            if($item['id'] == $id){
                array_push($data,$item);
            }
        }
        foreach($this->gambar as $img){
            if($img['id_data'] == $id){
                array_push($gambar,$img);
            }
        }
        return view('produk.detail',compact('gambar','data'));
    }
}
