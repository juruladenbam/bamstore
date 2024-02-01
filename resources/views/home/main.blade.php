@extends('layouts.app')

@section('content')
<div data-bs-spy="scroll" class="scrollspy-example">
    <!-- Hero: Start -->
    {{-- <section id="landingHero" class="section-py landing-hero">
      <div class="container">
        <div class="hero-text-box text-center">
          <h1 class="text-primary hero-title">Yang Sudah Pesan <strong>10</strong></h1>
          <div class="mb-4">
            <div class="card h-100">
              <div class="d-flex justify-content-between py-2 px-4 border-bottom">
                <h6 class="mb-0 small">NAMA</h6>
                <h6 class="mb-0 small">PESANAN</h6>
              </div>
              <div class="card-body">
                <ul class="p-0 m-0">
                    @php
                        $orders = [1,2,3,4,5,6,7,8,9,10];
                    @endphp
                    @foreach ($orders as $order)
                    <li class="d-flex mb-4">
                      <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                        <div class="me-2">
                          <h6 class="mb-0">Nama</h6>
                          <small>Qobilah</small>
                        </div>
                        <ul>
                          <li>
                              <div class="badge bg-label-primary rounded-pill">Kaos Dewasa XL 2x</div>
                          </li>
                          <li>
                              <div class="badge bg-label-primary rounded-pill">Kaos Anak L 1x</div>
                          </li>
                          <li>
                              <div class="badge bg-label-primary rounded-pill">Sarung Dewasa</div>
                          </li>
                          <li>
                              <div class="badge bg-label-primary rounded-pill">Sarung Anak</div>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <hr>
                    @endforeach
                </ul>
                <p>
                    <a href="#">Selengkapnya...</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> --}}
    <!-- Hero: End -->

    <!-- Our great team: Start -->
    <section id="landingTeam" class="section-py landing-team">
      <div class="container bg-icon-right">
        <div class="row gy-5 mt-2 mb-4">
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


        <div class="hero-text-box text-center">
            <h1 class="text-primary hero-title">Yang Sudah Pesan <strong>10</strong></h1>
            <div class="mb-4">
              <div class="card h-100">
                <div class="d-flex justify-content-between py-2 px-4 border-bottom">
                  <h6 class="mb-0 small">NAMA</h6>
                  <h6 class="mb-0 small">PESANAN</h6>
                </div>
                <div class="card-body">
                  <ul class="p-0 m-0">
                      @php
                          $orders = [1,2,3,4,5,6,7,8,9,10];
                      @endphp
                      @foreach ($orders as $order)
                      <li class="d-flex mb-4">
                        <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                          <div class="me-2">
                            <h6 class="mb-0">Nama</h6>
                            <small>Qobilah</small>
                          </div>
                          <ul>
                            <li>
                                <div class="badge bg-label-primary rounded-pill">Kaos Dewasa XL 2x</div>
                            </li>
                            <li>
                                <div class="badge bg-label-primary rounded-pill">Kaos Anak L 1x</div>
                            </li>
                            <li>
                                <div class="badge bg-label-primary rounded-pill">Sarung Dewasa</div>
                            </li>
                            <li>
                                <div class="badge bg-label-primary rounded-pill">Sarung Anak</div>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <hr>
                      @endforeach
                  </ul>
                  <p>
                      <a href="#">Selengkapnya...</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </section>
    <!-- Our great team: End -->

  </div>
@endsection
