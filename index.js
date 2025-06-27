document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll untuk navigasi (Sama seperti sebelumnya)
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Sembunyikan navigasi mobile setelah link diklik
            const mainNav = document.getElementById('main-navigation');
            const menuToggle = document.querySelector('.menu-toggle');
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
            }

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Opsional: Efek kecil saat scroll (header mengecil) - Sama seperti sebelumnya
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- LOGIKA BARU UNTUK HAMBURGER MENU ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-navigation');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            // Toggle kelas 'active' pada navigasi untuk menampilkan/menyembunyikan
            mainNav.classList.toggle('active');
            // Toggle kelas 'active' pada tombol toggle untuk animasi hamburger
            menuToggle.classList.toggle('active');

            // Atur atribut ARIA untuk aksesibilitas
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Opsional: Sembunyikan dropdown jika klik di luar area navigasi
    document.addEventListener('click', (event) => {
        if (menuToggle && mainNav) {
            const isClickInsideNav = mainNav.contains(event.target) || menuToggle.contains(event.target);
            if (!isClickInsideNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Mengarahkan tombol "Pesan Sekarang!" atau "Lihat Menu Lengkap & Pesan"
    // ke halaman pemesanan yang sudah ada (pemesanan.html)
    // Pastikan tombol ini ada di HTML Anda: <a href="pemesanan.html" class="btn btn-primary">Pesan Sekarang!</a>
    // Link sudah diatur langsung di HTML
});