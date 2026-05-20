# Shopee Affiliate Upload Planner

Tool web lokal untuk menyiapkan antrian konten Shopee Affiliate.

## Fitur

- Input banyak produk sekaligus dari link atau format `judul | link | harga | kategori`.
- Generator caption, hashtag, dan jadwal upload.
- Kolom file video untuk video milik sendiri.
- Status antrian: Draft, Siap Upload, Sudah Upload, Perlu Dicek.
- Export CSV untuk workflow upload manual atau tool resmi lain.
- Tombol buka portal resmi Shopee Affiliate Indonesia.
- Tombol copy data upload per item.
- Data tersimpan di browser memakai `localStorage`.

## Cara pakai

1. Buka `index.html` di browser, atau jalankan `node server.js` lalu buka `http://127.0.0.1:5173`.
2. Tempel daftar produk di bagian **Input cepat**.
3. Isi path/nama file video yang kamu punya hak pakai.
4. Klik **Generate** untuk membuat caption, hashtag, dan jadwal.
5. Klik **Export CSV**.

## Deploy ke Vercel

1. Upload folder ini ke GitHub.
2. Buka Vercel, pilih **Add New Project**.
3. Import repository ini.
4. Biarkan framework preset sebagai **Other** atau static project.
5. Deploy.

Tidak perlu build command. Vercel akan menyajikan `index.html` sebagai halaman utama.

Lihat juga `DEPLOY_VERCEL.md` untuk setting singkatnya.

## Tentang scrape video

Tool ini tidak otomatis scrape atau download video dari Shopee. Pakai video yang kamu rekam sendiri, dari brand yang memberi izin, atau aset yang memang legal untuk digunakan dalam promosi affiliate.

## Tentang login Shopee

Tool ini menyediakan tombol untuk membuka portal resmi Shopee Affiliate (`https://affiliate.shopee.co.id/`). Login tetap dilakukan sendiri oleh pengguna di halaman Shopee. Tool ini tidak menyimpan username, password, OTP, cookie, atau session Shopee.
