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
        .preview{
            transition: transform 0.5s;
        }
        .preview:hover{
            transform: scale(1.5);
        }
        .pimage-thumbnail{
            display: flex;
            flex-direction: row;
            justify-content: center;
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

        .button-act button{
            width: 100%;
        }
    </style>
@endpush

@section('content')
<div data-bs-spy="scroll" class="scrollspy-example">
    <!-- Our great team: Start -->
    <section id="landingTeam" class="section-py landing-team">
        <div class="container bg-icon-right">
          <div class="row gy-5 mt-2">

            <input type="hidden" name="product_id" id="product_id" value="{{ $product->id }}">
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 pimage-container">
                <div class="pimage-show">
                    <img src="{{ asset('assets/img/produk/'.$product->product_images[0]->image) }}" class="img-fluid preview" alt="">
                </div>
                <div class="pimage-thumbnail">
                    @foreach ($product->product_images as $thumb)
                    <div class="thumbnail">
                        <img src="{{ asset('assets/img/produk/'.$thumb->image) }}" class="img-fluid thumbnail" alt="" width="150">
                    </div>
                    @endforeach
                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 pdetail-container">
                <div class="pdetail-name">
                    <h2>{{ $product->name }}</h2>
                </div>
                <div class="pdetail-price">
                    <p>Rp 0</p>
                </div>
                <div class="pdetail-variant-container">
                    @foreach ($variants as $variant)
                        <ul>
                            @if (count($variant->variant_item) > 0)
                            <li class="d-flex flex-column">
                                {{-- <div class="variant-section">
                                    <small>{{ $variant->name }}</small>
                                </div> --}}
                                <div class="variant-content">
                                    <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                                        @foreach ($variant->variant_item as $variant_item)
                                        <input
                                        type="radio"
                                        class="btn-check variant"
                                        name="{{ str_replace(' ','',$variant->name) }}"
                                        id="{{ str_replace(' ','',$variant->name).$variant_item->id }}"
                                        value="{{ $variant_item->id }}"
                                        >
                                        <label
                                        class="btn btn-outline-primary btn-xs waves-effect"
                                        for="{{ str_replace(' ','',$variant->name).$variant_item->id }}">{{ $variant_item->value }}</label>
                                        @endforeach
                                    </div>
                                </div>
                            </li>
                            @endif
                        </ul>
                    @endforeach
                </div>
                <div class="row pdetail-action mb-3">
                    <form id="formData">
                        <div class="col-xs-12 col-s-12 col-md-12 col-lg-6 col-xl-6 qty">
                            <input type="hidden" name="price" value="0">
                            <input type="number" class="form-control invoice-item-price mb-2" placeholder="Quantity" min="1" max="10" value="1">
                        </div>
                        <div class="col-xs-12 col-s-12 col-md-12 col-lg-6 col-xl-6 button-act">
                            <button type="button" class="btn btn-primary">Tambahkan ke Keranjang</button>
                        </div>
                    </form>
                </div>
                <div class="pdetail-description">
                    <h5>Deskripsi</h5>
                    <p></p>
                </div>
            </div>

          </div>
        </div>
      </section>
      <!-- Our great team: End -->

  </div>
@endsection

@push('append-script')
    <script>
        $('.thumbnail').click(function () {
            var imageSource = $(this).attr("src");
            $(".preview").attr("src", imageSource);
        });

        function formatAngka(angka) {
            return angka.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        $('.variant').change(function() {
            var variantValues = [];
            $('.variant:checked').each(function() {
                variantValues.push($(this).val());
            });

            let priceHtml =$('.pdetail-price p')
            let product_id = $('#product_id').val()
            let url = "{{ route('produk-detail',['slug'=>$product->slug]) }}"
            priceHtml.html('Rp ...')
            $.get(url, {
                product_id:product_id,
                variant_item_id:variantValues,
            }).done(function(data){
                if(data){
                    console.log(data);
                    let price = parseInt(data.product.cost)+parseInt(data.product.profit)
                    let addon = 0;

                    $.map(data.variants, function (v) {
                        addon += parseInt(v.additional_price)
                    });

                    let totalPrice = price+addon

                    priceHtml.html('Rp '+formatAngka(totalPrice.toString()))
                    $('input[name=price]').val(totalPrice)
                }else{
                    $(this).removeAttr('checked')
                    Swal.fire ({
                        icon: "failed",
                        title: "Terjadi Kesalahan",
                        text: "Varian yg dipilih tidak ada",
                        showConfirmButton: false,
                        timer: 2500,
                    });
                }
            }).fail(function(xhr, status, error){
                $(this).removeAttr('checked')
                Swal.fire ({
                    icon: "error",
                    title: "Terjadi Kesalahan",
                    text: "Sistem Error",
                    showConfirmButton: false,
                    timer: 2500,
                });
            });
        });
    </script>
@endpush
