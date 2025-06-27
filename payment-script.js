// Memastikan semua kode JavaScript dijalankan setelah seluruh halaman HTML selesai dimuat.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEKLARASI VARIABEL UTAMA DAN PENGAMBILAN DATA DARI URL ---
    //    Ini adalah langkah pertama untuk "Kasir" (JavaScript) begitu Restoran (halaman) buka.
    //    Dia langsung mengambil catatan pesanan (parameter URL) dan menyiapkan alat-alatnya.

    // Mengambil data pesanan dari URL
    const urlParams = new URLSearchParams(window.location.search);
    let orderTotal = urlParams.get('total');        // Mengambil total harga
    let orderDetails = urlParams.get('details');    // Mengambil rincian menu yang dipesan
    let customerName = urlParams.get('name');       // Mengambil nama pelanggan
    let customerPhone = urlParams.get('phone');     // Mengambil nomor telepon pelanggan
    let customerNotes = urlParams.get('notes');

    // --- BARIS UNTUK DEBUGGING (Bisa Dihapus Nanti Setelah Berhasil) ---
    console.log('--- Debugging URL Parameters ---');
    console.log('Order Total (dari URL):', orderTotal);
    console.log('Order Details (dari URL):', orderDetails);
    console.log('Customer Name (dari URL):', customerName);
    console.log('Customer Phone (dari URL):', customerPhone);
    console.log('Catatan Tambahan (daru URL):', customerNotes);
    console.log('--------------------------------');
    // --- AKHIR BARIS DEBUGGING ---

    // Mengambil referensi (alamat) elemen-elemen HTML di halaman
    // Ini seperti Kasir menunjuk ke "Papan Total Pembayaran", "Daftar Pesanan", dll.
    const totalAmountSummary = document.getElementById('total-amount-summary');
    const orderDetailsList = document.getElementById('order-details-list');
   //const qrisImageContainer = document.getElementById('qris-image-container');//
    //const qrisImage = document.getElementById('qris-image');//
    const whatsappConfirmBtn = document.getElementById('whatsapp-confirm-btn'); // Tombol konfirmasi WhatsApp
    //const selectedQrisLabel = document.getElementById('selected-qris-label'); // Label untuk QRIS yang dipilih

    // --- PENTING: DEKLARASI NOMOR WHATSAPP DI SINI! ---
    // Inilah yang menyebabkan masalah 'undefined'. Pastikan baris ini ada di sini.
    // GANTI DENGAN NOMOR WHATSAPP RESTORAN/ANDA (format internasional tanpa '+', contoh: 6281234567890)
    const whatsappNumber = '6282292279959';


    // --- 2. DEFINISI OBJEK UNTUK URL GAMBAR QRIS ---
    //    Untuk pertanyaan Anda: "apakah harus URL bukan Image?"
    //    YA, ini harus URL (string yang menunjuk ke lokasi gambar).
    //    GANTI DENGAN URL GAMBAR QRIS ASLI ATAU URL PLACEHOLDER YANG DAPAT DIAKSES PUBLIK.
    //    (Contoh dari Google Images yang VALID, coba klik kanan gambar di Google Images lalu "Copy image address")
    // const qrisImages = {
    //     'qris-dana': '/image/Qris_Warung_CakMoer.png' // Contoh URL logo DANA dari situs resmi
    // };


    // --- 3. DEFINISI FUNGSI ---
    //    Ini adalah "Resep-resep" yang akan digunakan Kasir untuk melakukan tugas tertentu.
    //    Resep ini DIDEFINISIKAN di sini, tapi belum dijalankan.

    // Fungsi untuk memperbarui link (href) tombol WhatsApp
    // Fungsi ini menerima 4 "bahan": nama, telepon, total, dan rincian pesanan.
function updateWhatsappButton(name, phone, total, details, notes) { // <<< TAMBAHKAN ', notes' DI SINI
    // Memformat detail pesanan agar rapi di pesan WhatsApp
    const formattedDetails = details.replace(/;/g, '\n- ');

    // --- HAPUS ATAU KOMENTARI BARIS INI YANG MENYEBABKAN ERROR ---
    // --- AKHIR HAPUS/KOMENTARI ---

    // Membangun teks lengkap untuk pesan WhatsApp
    let whatsappMessage = `*KONFIRMASI PEMBAYARAN PESANAN*\n\n`;
    whatsappMessage += `Halo, kami telah menerima pembayaran pesanan atas nama: ${name}\n\n`;
    whatsappMessage += `*Nama:* ${name}\n`; // Ini redundant jika sudah ada di baris sebelumnya, mungkin bisa diatur ulang
    whatsappMessage += `*No. Telepon:* ${phone}\n`;
    whatsappMessage += `*Rincian Pesanan:*\n- ${formattedDetails}\n`;
    whatsappMessage += `*Total Pembayaran:* Rp ${total.toLocaleString('id-ID')}\n`;

    // >>> GANTI BLOK KODE INI DENGAN INI (gunakan parameter 'notes') <<<
    if (customerNotes.trim() !== '') { // Sekarang gunakan parameter 'notes'
        whatsappMessage += `*Catatan:* ${customerNotes}\n\n`;
    }
    // >>> AKHIR GANTI <<<

    whatsappMessage += `*Mohon segera proses pesanan saya. Terima kasih.*`;


        // --- BARIS PENTING YANG HARUS DIPERBAIKI/DIPASTIKAN KEMBALI ---
        // Menentukan URL untuk tombol WhatsApp.
        // PASTIKAN MENGGUNAKAN BACKTICK (`) dan TIDAK ADA SPAN TAG atau KARAKTER ANEH LAINNYA.
        if (whatsappConfirmBtn) { // Pastikan elemen tombol ada sebelum mengatur href
            whatsappConfirmBtn.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        }
        // --- BARIS DEBUGGING (Bisa Dihapus Nanti) ---
        console.log('Final WhatsApp Message:', whatsappMessage);
        console.log('Final WhatsApp URL:', whatsappConfirmBtn.href);
        // --- AKHIR DEBUGGING ---
    }


    // --- 4. LOGIKA UNTUK MENAMPILKAN DATA DI HALAMAN ---
    //    Ini adalah tugas Kasir untuk menuliskan informasi di papan kasir agar pelanggan lihat.

    // Menampilkan Total Pembayaran
    if (orderTotal) {
        orderTotal = parseInt(orderTotal); // Mengubah total dari string menjadi angka utuh
        // Menemukan semua elemen dengan class 'price-display' dan mengupdate teksnya
        document.querySelectorAll('.price-display').forEach(priceEl => {
            priceEl.textContent = `Rp ${orderTotal.toLocaleString('id-ID')}`;
        });
        // Mengupdate teks di elemen 'total-amount-summary'
        if (totalAmountSummary) {
            totalAmountSummary.textContent = `Rp ${orderTotal.toLocaleString('id-ID')}`;
        }
    } else {
        // Jika total tidak valid, tampilkan Rp 0
        document.querySelectorAll('.price-display').forEach(priceEl => {
            priceEl.textContent = 'Rp 0';
        });
        if (totalAmountSummary) {
            totalAmountSummary.textContent = 'Rp 0';
        }
    }

    // Menampilkan Rincian Pesanan
    if (orderDetails) {
        const detailsArray = decodeURIComponent(orderDetails).split('; '); // Memecah rincian menjadi array
        detailsArray.forEach(item => {
            const li = document.createElement('li'); // Membuat elemen list baru
            li.textContent = item;                   // Mengisi teks list
            orderDetailsList.appendChild(li);        // Menambahkan list ke daftar rincian
        });
    } else {
        // Jika rincian tidak tersedia
        const li = document.createElement('li');
        li.textContent = 'Detail pesanan tidak tersedia.';
        orderDetailsList.appendChild(li);
    }


    // --- 5. PEMANGGILAN AWAL FUNGSI SAAT HALAMAN DIMUAT ---
    //    Ini adalah saat Kasir pertama kali menjalankan "Resep" updateWhatsappButton.

    // Pastikan semua data penting (total, detail, nama, telepon) ada sebelum membuat link WhatsApp
    if (orderTotal && orderDetails && customerName && customerPhone) {
        console.log('Semua data dari URL LENGKAP. Memanggil updateWhatsappButton.');
        updateWhatsappButton(
            decodeURIComponent(customerName),    // Mendekode nama dari URL
            decodeURIComponent(customerPhone),   // Mendekode nomor telepon dari URL
            parseInt(orderTotal),                // Memastikan total adalah angka
            decodeURIComponent(orderDetails)     // Mendekode rincian pesanan dari URL
        );
    } else {
        // Jika ada data yang tidak lengkap, berikan link WhatsApp default
        console.log('Data dari URL TIDAK LENGKAP. Menampilkan pesan default WhatsApp.');
        if (whatsappConfirmBtn) {
            whatsappConfirmBtn.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Halo, saya ingin menanyakan status pesanan saya.")}`;
            whatsappConfirmBtn.textContent = "Hubungi Admin";
        }
    }


    // --- 6. LOGIKA UNTUK PILIHAN METODE PEMBAYARAN (QRIS, DLL.) ---
    //    Ini adalah bagian untuk menampilkan gambar QRIS saat pelanggan memilih opsi pembayaran.

    // const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    // paymentMethodRadios.forEach(radio => {
    //     radio.addEventListener('change', () => {
    //         const selectedQrisType = radio.value; // 'qris-gopay' atau 'qris-dana'
            
    //         // --- DEBUGGING QRIS (Bisa Dihapus Nanti) ---
    //         console.log('QRIS radio selected:', selectedQrisType);
    //         console.log('QRIS Image URL:', qrisImages[selectedQrisType]);
    //         // --- AKHIR DEBUGGING ---

    //         if (qrisImage) { // Pastikan elemen gambar ada
    //             qrisImage.src = qrisImages[selectedQrisType]; // Mengganti sumber gambar QRIS
    //         }

    //         if (qrisImageContainer) { // Pastikan container ada sebelum mengubah display
    //             qrisImageContainer.style.display = 'block'; // Menampilkan container gambar QRIS
    //         }

    //         // Memperbarui label QRIS yang dipilih (misal: "QRIS Gopay")
    //         // Gunakan logika yang lebih langsung untuk menghindari error split
    //         if (selectedQrisLabel) { // Pastikan selectedQrisLabel ada
    //             if (selectedQrisType === 'qris-gopay') {
    //                 selectedQrisLabel.textContent = 'QRIS (Gopay/OVO/Dana)';
    //             } else if (selectedQrisType === 'qris-dana') {
    //                 selectedQrisLabel.textContent = 'QRIS (Dana)';
    //             }
    //         }
    //     });
    // });

}); // Akhir dari document.addEventListener('DOMContentLoaded', () => { ... });