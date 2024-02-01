<nav class="layout-navbar container shadow-none py-0">
    <div class="navbar navbar-expand-lg landing-navbar border-top-0 px-3 px-md-4">
      <!-- Menu logo wrapper: Start -->
      <div class="navbar-brand app-brand demo d-flex py-0 py-lg-2 me-4">
        <!-- Mobile menu toggle: Start-->
        <button
          class="navbar-toggler border-0 px-0 me-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <i class="tf-icons mdi mdi-menu mdi-24px align-middle"></i>
        </button>
        <!-- Mobile menu toggle: End-->
        <a href="{{ route('home') }}" class="app-brand-link">
          <span class="app-brand-text demo menu-text fw-bold ms-2 ps-1">BAM Store</span>
        </a>
      </div>
      <!-- Menu logo wrapper: End -->
      <!-- Menu wrapper: Start -->
      <div class="collapse navbar-collapse landing-nav-menu" id="navbarSupportedContent">
        <button
          class="navbar-toggler border-0 text-heading position-absolute end-0 top-0 scaleX-n1-rtl"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <i class="tf-icons mdi mdi-close"></i>
        </button>
        <ul class="navbar-nav me-auto p-3 p-lg-0">
          <li class="nav-item">
            <a class="nav-link fw-medium" aria-current="page" href="{{ route('home') }}">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link fw-medium" href="{{ route('produk') }}">Produk</a>
          </li>
        </ul>
      </div>
      <div class="landing-menu-overlay d-lg-none"></div>
      <!-- Menu wrapper: End -->
      <!-- Toolbar: Start -->
      <ul class="navbar-nav flex-row align-items-center ms-auto">
        <!-- navbar button: Start -->
        <li>
          <a
            href="#"
            class="btn btn-primary px-2 px-sm-4 px-lg-2 px-xl-4"
            ><span class="tf-icons mdi mdi-shopping me-md-1"></span
            ><span class="d-none d-md-block">Keranjang (<span id="countCart">0</span>)</span></a
          >
        </li>
        <!-- navbar button: End -->
      </ul>
      <!-- Toolbar: End -->
    </div>
  </nav>
