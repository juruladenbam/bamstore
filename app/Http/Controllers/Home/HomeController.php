<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function main() {
        $gambar = [
            [
                'id_gambar' => '1',
                'id_data' => '1',
                'gambar' => 'bamstore size chart kaos.jpg',
            ],
            [
                'id_gambar' => '2',
                'id_data' => '1',
                'gambar' => 'bamstore desain kaos.jpg',
            ],
            [
                'id_gambar' => '3',
                'id_data' => '1',
                'gambar' => 'bamstore kaos.jpg',
            ],
            [
                'id_gambar' => '4',
                'id_data' => '2',
                'gambar' => 'bamstore sarung.jpg',
            ],
        ];
        $data = [
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
        return view('home.main',compact('data','gambar'));
    }
}
