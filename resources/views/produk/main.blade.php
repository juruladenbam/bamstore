@extends('layouts.app')

@section('content')
<div data-bs-spy="scroll" class="scrollspy-example">

    <!-- Our great team: Start -->
    <section id="landingTeam" class="section-py landing-team">
        <div class="container bg-icon-right">
          <div class="row gy-5 mt-2">
            @foreach ($data as $item)
            <div class="col-lg-3 col-sm-6">
              <div class="card card-hover-border-primary mt-3 mt-lg-0 shadow-none">
                <div class="bg-label-{{ $item->product->bg }} position-relative team-image-box">
                  <img
                    src="{{ asset('assets/img/produk/'.$item->product->product_image->image) }}"
                    class="position-absolute card-img-position bottom-0 start-50 scaleX-n1-rtl"
                    alt="human image" />
                </div>
                <div class="card-body text-center">
                  <h5 class="card-title fw-semibold mb-1">
                      {{ $item->product->name }}
                  </h5>
                  <p class="card-text">BAM Fest 2024</p>
                  <label>Rp {{ number_format($item->price,0,',','.') }}</label>
                </div>
                <div class="card-footer text-center d-grid col-12">
                  <a href="{{ route('produk-detail',['slug'=>$item->product->slug]) }}" class="btn btn-primary stretched-link">Lihat</a>
                </div>
              </div>
            </div>
            @endforeach

          </div>
        </div>
      </section>
      <!-- Our great team: End -->

  </div>
@endsection
