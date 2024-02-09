<!DOCTYPE html>

<html
  lang="en"
  class="light-style layout-navbar-fixed layout-wide"
  dir="ltr"
  data-theme="theme-default"
  data-template="front-pages-no-customizer">
  <head>
    <meta
        http-equiv="Content-Security-Policy"
        content="upgrade-insecure-requests" />
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title>BAM Store</title>

    <meta name="description" content="" />

    @stack('prepand-style')
    @include('layouts.includes.styles')
    @stack('append-style')

    <!-- Helpers -->
    <script src="{{ asset('assets/assets/vendor/js/helpers.js') }}"></script>
    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->
    <script src="{{ asset('assets/assets/js/front-config.js') }}"></script>
  </head>

  <body>
    <script src="{{ asset('assets/assets/vendor/js/dropdown-hover.js') }}"></script>
    <script src="{{ asset('assets/assets/vendor/js/mega-dropdown.js') }}"></script>

    @php
        $guest = session()->get('guest');
        $guest_id = '';
        foreach ($guest as $value) {
            $guest_id = $value['guest_id'];
        }
    @endphp

    <input type="hidden" name="id_guest" value="{{ $guest_id }}">
    <!-- Navbar: Start -->
    @include('layouts.includes.navbar')
    <!-- Navbar: End -->

    <!-- Sections:Start -->

    @yield('content')

    <!-- / Sections:End -->

    <!-- Footer: Start -->
    @include('layouts.includes.footer')
    <!-- Footer: End -->

    <!-- Core JS -->
    @stack('prepand-script')
    @include('layouts.includes.scripts')
    @stack('append-script')
  </body>
</html>
