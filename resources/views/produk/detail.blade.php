@extends('layouts.app')

@push('append-style')
    <style>
        .pimage-show{
            display: flex;
            height: 300px;
        }
        .pimage-show img{
            width: 100%;
            object-fit: contain;
        }
        .pimage-thumbnail{
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            flex-wrap: nowrap;
            overflow-x: auto;
            width: 100%;
            height: 65px;
        }
        .pimage-thumbnail .thumbnail{
            width: 65px;
            height: 100%;
        }
        .thumbnail img{
            width: 100%;
            height: 65px;
            object-fit: contain;
        }

        .pdetail-variant-container ul{
            padding: 0;
        }
    </style>
@endpush

@section('content')
<div data-bs-spy="scroll" class="scrollspy-example">
    <!-- Our great team: Start -->
    <section id="landingTeam" class="section-py landing-team">
        <div class="container bg-icon-right">
          <div class="row gy-5 mt-2">

            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 pimage-container">
                <div class="pimage-show">
                    <img src="{{ asset('assets/img/produk/'.$product->product_images[0]->image) }}" class="img-fluid" alt="">
                </div>
                <div class="pimage-thumbnail">
                    @foreach ($product->product_images as $thumb)
                    <div class="thumbnail">
                        <img src="{{ asset('assets/img/produk/'.$thumb->image) }}" class="img-fluid" alt="" width="150">
                    </div>
                    @endforeach
                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 pdetail-container">
                <div class="pdetail-name">
                    <h2>{{ $product->name }}</h2>
                </div>
                <div class="pdetail-price">
                    <p>Rp {{ number_format($product->cost+$product->profit,0,',','.') }}</p>
                </div>
                <div class="pdetail-variant-container">
                    @foreach ($variants as $variant)
                        <ul>
                            @if (count($variant->variant_item) > 0)
                            <li class="d-flex flex-column">
                                <div class="variant-section">
                                    <small>{{ $variant->name }}</small>
                                </div>
                                <div class="variant-content">
                                    <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                                        @foreach ($variant->variant_item as $variant_item)
                                        <input type="radio" class="btn-check" name="{{ str_replace(' ','',$variant->name) }}" id="{{ str_replace(' ','',$variant->name).$variant_item->id }}" value="{{ $variant_item->id }}">
                                        <label class="btn btn-outline-primary btn-xs waves-effect" for="{{ str_replace(' ','',$variant->name).$variant_item->id }}">{{ $variant_item->value }}</label>
                                        @endforeach
                                    </div>
                                </div>
                            </li>
                            @endif
                        </ul>
                    @endforeach
                </div>
                <div class="row pdetail-action mb-3">
                    <div class="col-xs-12 col-s-12 col-md-12 col-lg-6 col-xl-6 qty">
                        <input type="number" class="form-control invoice-item-price mb-2" placeholder="Quantity" min="1" max="10" value="1">
                    </div>
                    <div class="col-xs-12 col-s-12 col-md-12 col-lg-6 col-xl-6 button-act d-grid">
                        <button class="btn btn-primary">Tambahkan ke Keranjang</button>
                    </div>
                </div>
                <div class="pdetail-description">
                    <h5>Deskripsi</h5>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora aliquid numquam quae, inventore iste expedita eius. Ullam incidunt totam maxime, obcaecati architecto eligendi! Recusandae incidunt, provident iure repellendus cum obcaecati!</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora aliquid numquam quae, inventore iste expedita eius. Ullam incidunt totam maxime, obcaecati architecto eligendi! Recusandae incidunt, provident iure repellendus cum obcaecati!</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora aliquid numquam quae, inventore iste expedita eius. Ullam incidunt totam maxime, obcaecati architecto eligendi! Recusandae incidunt, provident iure repellendus cum obcaecati!</p>
                </div>
            </div>

          </div>
        </div>
      </section>
      <!-- Our great team: End -->

  </div>
@endsection
