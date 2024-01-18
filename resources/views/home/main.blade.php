@extends('layouts.app')

@section('content')
<div data-bs-spy="scroll" class="scrollspy-example">
    <!-- Hero: Start -->
    <section id="landingHero" class="section-py landing-hero">
      <div class="container">
        <div class="hero-text-box text-center">
          <h1 class="text-primary hero-title">Yang Sudah Pesan</h1>
          {{-- <h2 class="h6 mb-4 pb-1 lh-lg">
            No coding required to make customisations.<br />The live customiser has everything your marketing need.
          </h2> --}}
          <div class="orders-data mt-5 mb-5">
            <div class="card">
                <div class="card-body">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Pesanan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>x</td>
                                <td>x</td>
                                <td>x</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
          {{-- <a href="#landingPricing" class="btn btn-primary mb-5">Pesan Sekarang</a> --}}
        </div>
        {{-- <div class="position-relative hero-animation-img">
          <a href="../vertical-menu-template/app-ecommerce-dashboard.html" target="_blank">
            <div class="hero-dashboard-img text-center">
              <img
                src="{{ asset('assets/assets/img/front-pages/landing-page/hero-dashboard-light.png') }}"
                alt="hero dashboard"
                class="animation-img"
                data-speed="2"
                data-app-light-img="front-pages/landing-page/hero-dashboard-light.png"
                data-app-dark-img="front-pages/landing-page/hero-dashboard-dark.png" />
            </div>
            <div class="position-absolute hero-elements-img">
              <img
                src="{{ asset('assets/assets/img/front-pages/landing-page/hero-elements-light.png') }}"
                alt="hero elements"
                class="animation-img"
                data-speed="4"
                data-app-light-img="front-pages/landing-page/hero-elements-light.png"
                data-app-dark-img="front-pages/landing-page/hero-elements-dark.png" />
            </div>
          </a>
        </div> --}}
      </div>
    </section>
    <!-- Hero: End -->

    <!-- Our great team: Start -->
    <section id="landingTeam" class="section-py landing-team">
      <div class="container bg-icon-right">
        {{-- <h6 class="text-center fw-semibold d-flex justify-content-center align-items-center mb-4">
          <span class="text-uppercase">our great team</span>
        </h6>
        <h3 class="text-center mb-2"><span class="fw-bold">Supported</span> by Real People</h3>
        <p class="text-center fw-medium mb-3 mb-md-5 pb-3">Who is behind these great-looking interfaces?</p> --}}
        <div class="row gy-5 mt-2">
          @foreach ($data as $item)
          <div class="col-lg-3 col-sm-6">
            <div class="card card-hover-border-primary mt-3 mt-lg-0 shadow-none">
              <div class="bg-label-{{ $item['bg'] }} position-relative team-image-box">
                <img
                  @if ($item['id'] == 1)
                  src="{{ asset('assets/img/produk/'.$gambar[0]['gambar']) }}"
                  @elseif($item['id'] == 2)
                  src="{{ asset('assets/img/produk/'.$gambar[3]['gambar']) }}"
                  @endif
                  class="position-absolute card-img-position bottom-0 start-50 scaleX-n1-rtl"
                  alt="human image" />
              </div>
              <div class="card-body text-center">
                <h5 class="card-title fw-semibold mb-1">
                    <a href="{{ route('produk-detail',['id'=>$item['id']]) }}" class="stretched-link">
                        {{ $item['nama'] }}
                    </a>
                </h5>
                <p class="card-text">BAM Fest 2024</p>
                {{-- <div class="text-center team-media-icons">
                  <a href="javascript:void(0);" class="text-heading" target="_blank">
                    <i class="tf-icons mdi mdi-facebook mdi-24px me-2"></i>
                  </a>
                  <a href="javascript:void(0);" class="text-heading" target="_blank">
                    <i class="tf-icons mdi mdi-twitter mdi-24px me-2"></i>
                  </a>
                  <a href="javascript:void(0);" class="text-heading" target="_blank">
                    <i class="tf-icons mdi mdi-linkedin mdi-24px"></i>
                  </a>
                </div> --}}
                <label>Rp {{ number_format($item['harga'],0,',','.') }}</label>
                <button type="button" class="btn btn-primary mt-3">Tambah ke Keranjang</button>
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
