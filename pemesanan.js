// Ganti dengan URL Aplikasi Web Google Apps Script-mu yang sudah kamu dapatkan!
// Langkah-langkah deploy ada di balasan sebelumnya. Pastikan akses "Anyone".
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmY6L7cHp_CCys0nzysFPFPyQU8dVIf3NAEqu6toytfa9IivtwtutdItPkl6UNWmYAMA/exec'; // <-- PENTING: GANTI INI!

const form = document.getElementById('foodOrderForm');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const spinner = document.getElementById('spinner');
const notificationCloseBtn = document.getElementById('notification-close-btn');

    // Fungsi untuk menampilkan notifikasi (dengan spinner opsional)
    function showNotification(message, type, showSpinner = false, showCloseButton = true) {
        notificationMessage.textContent = message;
        notification.className = `notification ${type}`; // Atur kelas untuk gaya (success, error, info)
        if (showSpinner) {
            spinner.style.display = 'inline-block'; // Tampilkan spinner
        } else {
            spinner.style.display = 'none'; // Sembunyikan spinner
        }
        if (showCloseButton) {
            notificationCloseBtn.style.display = 'block';
        } else {
            notificationCloseBtn.style.display = 'none';
        }
        notification.style.display = 'block'; // Tampilkan kotak notifikasi
        if (!showCloseButton) { // Jika tidak ada tombol close, sembunyikan otomatis
            setTimeout(() => {
                hideNotification();
            }, 3000); // Sembunyikan setelah 3 detik
        }
    }

    // Fungsi untuk menyembunyikan notifikasi
    function hideNotification() {
        notification.style.display = 'none';
        spinner.style.display = 'none';
        notificationCloseBtn.style.display = 'none';
    }


// --- LOGIKA UNTUK PILIHAN MENU GANDA (CHECKBOX) ---
const menuCheckboxes = document.querySelectorAll('.menu-item-card input[type="checkbox"]');
const menuQuantityInputs = document.querySelectorAll('.menu-quantity-input');
const menuSelectionError = document.getElementById('menu-selection-error');


// Event listener untuk setiap checkbox menu
menuCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const quantityInput = document.getElementById(`qty-${checkbox.id}`);
        if (checkbox.checked) {
            quantityInput.style.display = 'block'; // Tampilkan input jumlah
            quantityInput.value = 1; // Set default quantity to 1
            quantityInput.setAttribute('required', 'required'); // Buat required jika dicentang
        } else {
            quantityInput.style.display = 'none'; // Sembunyikan input jumlah
            quantityInput.value = 0; // Reset quantity to 0
            quantityInput.removeAttribute('required'); // Hapus required
        }
        // Sembunyikan pesan error jika sudah ada pilihan
        if (document.querySelectorAll('.menu-item-card input[type="checkbox"]:checked').length > 0) {
            menuSelectionError.style.display = 'none';
        }
    });
});

// Validasi tambahan sebelum submit: Pastikan setidaknya ada satu menu yang dipilih
form.addEventListener('submit', (e) => {
    const checkedMenus = document.querySelectorAll('.menu-item-card input[type="checkbox"]:checked').length;
    if (checkedMenus === 0) {
        e.preventDefault(); // Mencegah submit
        menuSelectionError.style.display = 'block'; // Tampilkan pesan error
    }
});


// --- LOGIKA UTAMA SUBMIT FORM KE GOOGLE SHEETS ---
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah form reload halaman

    // Dapatkan nilai nama dan telepon dari input form
    const customerName = document.getElementById('NamaCustomer').value; // Pastikan ID ini ada di HTML Anda
    const customerPhone = document.getElementById('NomorTelepon').value; // Pastikan ID ini ada di HTML Anda
    const customerNotes = document.getElementById('customerNotes').value;

    // Validasi dasar (opsional, tapi disarankan)
    if (!NamaCustomer || !NomorTelepon) {
        showNotification('Mohon isi Nama dan Nomor Telepon.', 'error', false, true);
        return;
    }

    let totalAmount = 0;
    let selectedMenusDetails = []; // Untuk menyimpan detail menu yang dipilih

    // Iterasi semua checkbox yang dicentang
    const checkedMenus = document.querySelectorAll('.menu-item-card input[type="checkbox"]:checked');

    // Validasi ulang: pastikan ada menu yang dipilih (seharusnya sudah ditangani event listener di atas, tapi jaga-jaga)
    if (checkedMenus.length === 0) {
        showNotification('Mohon pilih setidaknya satu item menu.', 'error', false, true);
        return; // Hentikan proses submit jika tidak ada menu dipilih
    }

    // Hitung total harga dan kumpulkan detail menu
    checkedMenus.forEach(checkbox => {
        const menuName = checkbox.value;
        const price = parseFloat(checkbox.dataset.price); // Ambil harga dari data-price di HTML
        const quantityInput = document.getElementById(`qty-${checkbox.id}`);
        const quantity = parseInt(quantityInput.value);

        if (quantity > 0) { // Hanya hitung jika kuantitas lebih dari 0
            totalAmount += price * quantity;
            // KOREKSI PENTING DI SINI: pastikan format string benar
            selectedMenusDetails.push(`${menuName} (${quantity} porsi)`); 
        }
    });

    // Validasi: pastikan totalAmount tidak 0 jika ada menu yang dipilih tapi semua kuantitas 0
    if (totalAmount === 0 && checkedMenus.length > 0) {
        showNotification('Mohon masukkan jumlah porsi yang valid (lebih dari 0) untuk menu yang dipilih.', 'error', false, true);
        return;
    }


    const formData = new FormData(form);
    // Tambahkan total harga ke formData (ini akan dikirim ke Google Sheet juga)
    formData.append('TotalPembayaran', totalAmount); // Pastikan ada kolom 'TotalPembayaran' di Google Sheet

    // Tambahkan detail menu yang dipilih ke formData sebagai string
    formData.append('PesananDetail', selectedMenusDetails.join('; ')); // Pastikan ada kolom 'PesananDetail' di Google Sheet


    // Tampilkan notifikasi loading dengan spinner
    showNotification('Mengirim Pesanan...', 'info', true, false);

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.result === 'success') {
            showNotification('Pesanan berhasil dikirim! Terima kasih.', 'success', false, false);
            form.reset(); // Bersihkan form
            
            // Redirect ke halaman pembayaran dengan menambahkan total harga dan detail pesanan di URL
            setTimeout(() => {
                hideNotification();
                // EncodeURI untuk memastikan spasi dan karakter khusus di PesananDetail tidak merusak URL
                // Harusnya seperti ini:
               // Tambahkan customerName dan customerPhone sebagai parameter URL
            window.location.href = `payment-index.html?total=${totalAmount}&details=${encodeURIComponent(selectedMenusDetails.join('; '))}&name=${encodeURIComponent(customerName)}&phone=${encodeURIComponent(customerPhone)}&notes=${encodeURIComponent(customerNotes)}`;
}, 1500); // Redirect setelah 1.5 detik
            
        } else {
            showNotification('Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi. Detail: ' + (result.message || 'Tidak diketahui'), 'error', false, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan jaringan atau server. Silakan coba lagi.', 'error', false, true);
    }
});

// Event listener untuk tombol tutup notifikasi
notificationCloseBtn.addEventListener('click', hideNotification);

// --- LOGIKA UNTUK RATING BINTANG ---
const stars = document.querySelectorAll('.star');
const ratingInput = document.getElementById('rating');

stars.forEach(star => {
    star.addEventListener('click', () => {
        const value = parseInt(star.dataset.value);
        ratingInput.value = value;
        stars.forEach(s => {
            if (parseInt(s.dataset.value) <= value) {
                s.classList.add('selected');
            } else {
                s.classList.remove('selected');
            }
        });
    });
});