# Kartu Ucapan Ulang Tahun 🎂

Template kartu ucapan ulang tahun berbasis web: ada animasi saat digulir, kalender
bertanda hati, amplop yang bisa ditekan, dan ledakan bunga saat dirayakan.

Dibuat dengan HTML, CSS, dan JavaScript murni. Tanpa framework, tanpa proses build,
tanpa perlu install apa pun. Cukup buka filenya di browser.

---

## Demo

Sudah tayang di: **https://template-birthday-1.vercel.app**

---

## Daftar Isi

- [Fitur](#fitur)
- [Struktur Berkas](#struktur-berkas)
- [Cara Pakai Cepat](#cara-pakai-cepat)
- [Panduan Kustomisasi](#panduan-kustomisasi)
  - [1. Mengubah Nama](#1-mengubah-nama)
  - [2. Mengubah Foto](#2-mengubah-foto)
  - [3. Mengubah Tanggal Ulang Tahun](#3-mengubah-tanggal-ulang-tahun)
  - [4. Mengubah Ucapan dan Doa](#4-mengubah-ucapan-dan-doa)
  - [5. Mengubah Isi Kartu](#5-mengubah-isi-kartu)
  - [6. Mengubah Bagian Penutup](#6-mengubah-bagian-penutup)
  - [7. Mengubah Isi Toples Harapan](#7-mengubah-isi-toples-harapan)
  - [8. Mengubah Lagu](#8-mengubah-lagu)
  - [9. Mengubah Warna Tema](#9-mengubah-warna-tema)
- [Upload ke GitHub Pages](#upload-ke-github-pages)
- [Tips dan Catatan](#tips-dan-catatan)

---

## Fitur

| Fitur | Keterangan |
|---|---|
| Animasi dua arah | Animasi berjalan setiap kali digulir ke bawah **maupun** ke atas, bukan sekali saja |
| Kalender otomatis | Tanggal dihitung sendiri, tidak perlu ditulis manual |
| Tanda hati | Hati digambar di tanggal ulang tahun |
| Amplop interaktif | Ditekan lalu menghilang, digantikan kartu berisi foto dan pesan |
| Ledakan bunga | Bunga asli beterbangan saat tombol ditekan |
| Timeline vertikal | Bagian ucapan berbentuk garis waktu bernomor |
| Toples Harapan | Tombol dikocok, tutup toples terbuka, kertas terbang ke kartu, satu harapan keluar acak |
| Musik | Lagu menyala sendiri saat halaman dibuka, bisa dibisukan lewat tombol di kanan atas |
| Responsif | Sudah diuji di 360px, 390px, 768px, dan 1024px |
| Ringan | Total di bawah 1 MB, tanpa dependensi eksternal |

---

## Struktur Berkas

```
.
├── index.html              # Struktur halaman
├── css/
│   └── style.css           # Seluruh tampilan
├── data/
│   └── harapan.json        # ⭐ 100 HARAPAN DI DALAM TOPLES
├── js/
│   ├── config.js           # ⭐ SEMUA TEKS DIUBAH DI SINI
│   ├── main.js             # Animasi dan interaksi
│   ├── calendar.js         # Pembuat kalender otomatis
│   ├── petals.js           # Kelopak bunga berjatuhan
│   └── music.js            # Lagu Happy Birthday
└── assets/
    ├── lagu.mp3            # ⭐ LAGU YANG DIPUTAR
    ├── kartu-foto.webp     # ⭐ FOTO DI DALAM KARTU (1:1)
    ├── chibi-maruko.webp   # Ilustrasi di bagian pembuka
    ├── bunga-cosmos.webp   # Hiasan bunga
    ├── bunga-plumeria.webp
    ├── bunga-daisy.webp
    ├── bunga-lily.webp
    ├── bunga-matahari.webp
    ├── buket-lily.webp     # Buket di samping kalender
    ├── vendor/             # GSAP (sudah disertakan, tidak perlu internet)
    └── ...                 # Berkas pendukung lain
```

> **Penting:** hampir semua perubahan cukup dilakukan di `js/config.js` dan
> `assets/kartu-foto.webp`. Berkas lain tidak perlu disentuh.

---

## Cara Pakai Cepat

1. **Download** atau **clone** repositori ini.
2. Buka `js/config.js`, ubah nama dan tanggalnya (lihat panduan di bawah).
3. Ganti `assets/kartu-foto.webp` dengan fotomu sendiri.
4. Buka `index.html` di browser untuk melihat hasilnya.

Untuk melihat hasil dengan benar (agar semua berkas termuat), jalankan server lokal:

```bash
# Python 3
python -m http.server 8000

# atau Node.js
npx serve
```

Lalu buka `http://localhost:8000`.

---

## Panduan Kustomisasi

Semua teks ada di **`js/config.js`**. Buka berkas itu dengan editor teks apa pun
(Notepad, VS Code, dan sejenisnya).

### 1. Mengubah Nama

Cari bagian ini di `js/config.js`:

```js
nama: "masukkan_nama_panjang",
panggilan: "masukkan_nama_panggilan",
umur: 17,
```

Ubah menjadi:

```js
nama: "Nama Lengkap Kamu",
panggilan: "Nama Panggilan",
umur: 20,
```

| Baris | Fungsi |
|---|---|
| `nama` | Nama panjang, tampil besar di tengah halaman pembuka |
| `panggilan` | Nama pendek, tampil di judul tab browser |
| `umur` | Angka umur, tampil sebagai "yang ke-20". Isi `null` bila tidak ingin ditampilkan |

> Perhatikan tanda kutip (`"`) di awal dan akhir. Jangan dihapus, nanti error.
> Setiap baris diakhiri tanda koma (`,`), kecuali baris terakhir.

---

### 2. Mengubah Foto

Foto di dalam kartu ada di `assets/kartu-foto.webp`.

**Syarat foto:**
- Bentuk **persegi (1:1)** supaya tampil pas tanpa terpotong aneh
- Format `.webp` (paling ringan). Format `.jpg` atau `.png` juga bisa, tapi
  jangan lupa ubah namanya di `index.html`
- Ukuran disarankan 560 × 560 piksel

**Cara paling mudah (tanpa install aplikasi):**

1. Buka [squoosh.app](https://squoosh.app) di browser
2. Masukkan fotomu
3. Pada panel kanan, pilih:
   - **Resize** → ubah jadi 560 × 560
   - **Compress** → pilih **WebP**, kualitas sekitar 90
4. Download hasilnya
5. Ganti berkas `assets/kartu-foto.webp` dengan hasil download tadi

**Kalau fotomu belum persegi**, potong dulu jadi persegi di aplikasi apa pun
(Photos, Canva, atau editor HP), supaya tidak terpotong di tengah.

**Kalau ingin pakai nama berkas lain**, misalnya `foto-aku.jpg`:

1. Simpan berkas ke folder `assets/`
2. Buka `index.html`, cari baris ini (sekitar baris 168):

```html
<img src="assets/kartu-foto.webp"
     alt="Buket kenangan" width="560" height="560">
```

3. Ganti `assets/kartu-foto.webp` menjadi `assets/foto-aku.jpg`
4. Sesuaikan juga `alt` (keterangan untuk pembaca layar) bila perlu

---

### 3. Mengubah Tanggal Ulang Tahun

Cari bagian `kalender` di `js/config.js`:

```js
kalender: {
  tahun: 2026,
  bulan: 7,
  namaBulan: "Juli",
  hariSpesial: [31],
},
```

Lalu ubah `tanggal` di bagian atas:

```js
tanggal: "31 Juli 2026",
```

| Baris | Fungsi |
|---|---|
| `tahun` | Tahun. Isi `null` untuk memakai tahun berjalan otomatis |
| `bulan` | Angka bulan: 1 = Januari, 2 = Februari, ... 12 = Desember |
| `namaBulan` | Nama bulan yang ditampilkan. **Harus cocok** dengan angka `bulan` |
| `hariSpesial` | Tanggal yang diberi tanda hati. Bisa lebih dari satu, contoh `[4, 17]` |
| `tanggal` | Teks tanggal di halaman pembuka |

**Contoh: ulang tahun 17 Agustus 2027**

```js
tanggal: "17 Agustus 2027",
```

```js
kalender: {
  tahun: 2027,
  bulan: 8,
  namaBulan: "Agustus",
  hariSpesial: [17],
},
```

> **Penting:** kalau mengubah `bulan`, wajib ubah `namaBulan` juga. Kalau tidak,
> judul kalender akan menampilkan bulan yang salah.

> **Tips:** kalau tanggalnya lupa hari apa, kalender akan menghitungnya sendiri.
> Kamu tidak perlu tahu tanggal itu jatuh di hari Senin atau Minggu.

---

### 4. Mengubah Ucapan dan Doa

Bagian ini tampil sebagai **timeline vertikal** dengan bulatan nomor.

```js
ucapan: [
  {
    ikon: "01",
    judul: "Panjang Umur",
    isi: "Semoga panjang umur, sehat selalu...",
  },
  {
    ikon: "02",
    judul: "Bahagia Selalu",
    isi: "Semoga hari-harimu dipenuhi hal-hal kecil...",
  },
],
```

| Baris | Fungsi |
|---|---|
| `ikon` | Teks di dalam bulatan. Sebaiknya angka: `"01"`, `"02"`, `"03"` |
| `judul` | Judul kartu |
| `isi` | Isi pesannya |

**Menambah kartu baru:** salin satu blok `{ ... }` lengkap dengan kurung
kurawalnya, tempel di bawahnya, lalu beri koma di antara blok. Contoh:

```js
ucapan: [
  { ikon: "01", judul: "Judul Pertama", isi: "Pesan pertama." },
  { ikon: "02", judul: "Judul Kedua", isi: "Pesan kedua." },
  { ikon: "03", judul: "Judul Ketiga", isi: "Pesan ketiga." },
],
```

**Menghapus kartu:** hapus satu blok `{ ... }` beserta komanya.

> Nomor bulatan tidak bertambah otomatis. Kalau menambah kartu, ubah sendiri
> angka `ikon`-nya supaya berurutan.

> Kalau `isi` terlalu panjang, tulisannya otomatis turun ke baris berikutnya.
> Kalau ingin lebih rapi, pecah jadi dua bagian seperti ini:
> ```js
> isi: "Bagian pertama pesan ini, "
>    + "lalu sambungannya di sini.",
> ```

---

### 5. Mengubah Isi Kartu

Kartu adalah yang muncul setelah amplop ditekan. Ada foto di atas dan pesan di bawahnya.

```js
kartu: {
  pembuka: "Untuk kamu,",
  isi: [
    "Terima kasih sudah menjadi dirimu yang sabar, yang kuat, dan yang "
    + "selalu berusaha meskipun keadaannya tidak selalu mudah.",
    "Semoga di tahun ini bisa menjadi lebih baik daripada tahun kemarin.",
  ],
  penutup: "dengan cinta",
  pengirim: "Orang yang menyayangimu",
},
```

| Baris | Fungsi |
|---|---|
| `pembuka` | Sapaan di atas pesan, contoh `"Untuk Via,"` |
| `isi` | Daftar paragraf pesan. Setiap tanda kutip adalah satu paragraf |
| `penutup` | Kalimat penutup, contoh `"dengan cinta"` |
| `pengirim` | Nama pengirim di paling bawah |

**Menambah paragraf:** tambahkan baris baru di dalam `isi: [ ... ]`, pisahkan
dengan koma. **Menghapus paragraf:** hapus barisnya.

> **Saran:** jaga agar pesannya tidak terlalu panjang. Semakin panjang teksnya,
> semakin panjang pula kartunya. Tiga paragraf pendek sudah cukup.

---

### 6. Mengubah Bagian Penutup

```js
penutup: {
  judul: "Bahagia selalu",
  isi: "Tekan tombol di bawah untuk melihat sesuatu yang menakjubkan",
  tombol: "Lihat Kejutan!",
},
```

| Baris | Fungsi |
|---|---|
| `judul` | Judul besar di bagian akhir |
| `isi` | Kalimat ajakan di atas tombol |
| `tombol` | Teks pada tombol |

> Kalau mengubah `tombol`, sebaiknya sesuaikan juga `isi`-nya agar nyambung.
> Contoh: `isi: "Klik untuk membuka kejutan"` dengan `tombol: "Buka Kejutan!"`.

---

### 7. Mengubah Isi Toples Harapan

Bagian "Toples Harapan" berisi harapan yang keluar secara acak saat tombol
dikocok. Isinya ada di **`data/harapan.json`**, terpisah dari kode supaya
berkasnya tetap ringan dan mudah diubah.

Isi berkasnya berupa daftar teks, seperti ini:

```json
[
  "Semoga tahun ini penuh hal baik yang datang tanpa kamu duga.",
  "Semoga kamu selalu diberi kesehatan dan kekuatan untuk menjalani harimu.",
  "Semoga setiap usahamu menemukan hasil yang pantas."
]
```

**Mengubah harapan:** ganti teksnya, tapi jangan hapus tanda kutip (`"`) atau
koma (`,`) di akhir baris.

**Menambah harapan:** tambahkan baris baru sebelum tanda `]` di paling bawah,
lalu beri koma di baris sebelumnya. Contoh:

```json
[
  "Harapan pertama.",
  "Harapan kedua.",
  "Harapan ketiga yang baru ditambahkan."
]
```

**Menghapus harapan:** hapus satu baris lengkap, pastikan baris terakhir
tidak diakhiri koma.

**Tentang animasinya:** saat tombol dikocok, tutup toples terangkat lalu
kertas kecil terbang keluar menuju kartu. Arah terbangnya menyesuaikan
tata letak: ke kanan bila kartunya ada di samping, ke bawah bila kartunya
ada di bawah (tampilan ponsel). Tidak ada yang perlu diatur untuk ini.

> Jumlahnya tidak harus 100. Berapa pun isinya akan tetap dikocok secara acak.
> Angka 100 di atas hanya contoh.

> **Penting:** berkas JSON tidak boleh memakai tanda koma di baris terakhir.
> Kalau salah, seluruh harapannya gagal dimuat. Bila itu terjadi, tombol
> "Kocok Toples" akan mati dan muncul pesan agar halaman dibuka lewat server
> lokal. Untuk memeriksa apakah formatnya benar, tempel isi berkasnya ke
> [jsonlint.com](https://jsonlint.com).

> Urutan harapan yang keluar memang diacak, dan harapan yang baru saja keluar
> tidak akan langsung muncul lagi. Jadi pengguna bisa mengocok berkali-kali
> tanpa merasa mengulang.

---

### 8. Mengubah Lagu

Lagu yang diputar ada di **`assets/lagu.mp3`**. Musiknya menyala sendiri
begitu halaman dibuka, dan bisa dibisukan lewat tombol di kanan atas.

Pengaturannya ada di `js/config.js`:

```js
musik: {
  berkas: "assets/lagu.mp3",    // berkas lagunya
  auto: true,                   // true = coba putar sendiri saat halaman dibuka
  volume: 0.45,                 // 0 = sunyi, 1 = paling keras
  ulang: true,                  // true = lagu diputar berulang terus
},
```

| Baris | Fungsi |
|---|---|
| `berkas` | Letak berkas lagunya |
| `auto` | `true` = menyala sendiri saat halaman dibuka |
| `volume` | Kekerasan lagu. `0.45` berarti 45 persen |
| `ulang` | `true` = diputar berulang terus sampai dibisukan |

**Mengganti lagunya:**

1. Siapkan berkas MP3 milikmu
2. Ganti berkas `assets/lagu.mp3` dengan berkas itu
3. Selesai. Tidak ada yang perlu diubah di kode

**Kalau nama berkasnya berbeda**, misalnya `lagu-aku.mp3`:

1. Simpan berkas ke folder `assets/`
2. Ubah `berkas: "assets/lagu-aku.mp3"` di `config.js`
3. Ubah juga baris ini di `index.html` (sekitar baris 18) agar lagunya diambil
   lebih awal:
   ```html
   <link rel="preload" href="assets/lagu-aku.mp3" as="audio" type="audio/mpeg">
   ```

**Tentang ukuran berkas:** usahakan di bawah 5 MB. Lagu 5 menit biasanya
sekitar 4 MB bila disimpan pada kualitas 112 kbps. Bila berkasmu lebih besar,
kecilkan dulu memakai [squoosh.app](https://squoosh.app) atau aplikasi
pengubah audio. Lagu yang terlalu besar membuat halaman lambat dibuka.

**Tentang putar otomatis:** semua browser (Chrome, Safari, Firefox, Edge)
melarang suara berbunyi otomatis sebelum pengguna menyentuh halaman. Ini
kebijakan browser, bukan kesalahan kode. Aturannya:

| Yang dicoba | Hasil |
|---|---|
| Suara otomatis | Diblokir, kecuali kamu sering membuka situs itu |
| Bisu otomatis | Selalu diizinkan, tanpa syarat |
| Dinyalakan setelah menyentuh halaman | Selalu diizinkan |

Karena itu halaman ini memakai cara berlapis: lagunya dicoba diputar dengan
suara. Bila diblokir, lagunya tetap **dijalankan dalam keadaan bisu** sehingga
sudah berjalan dari detik pertama. Begitu halaman disentuh, diklik, digulir,
atau ada tombol ditekan, suaranya langsung menyala dan menyambung dari posisi
yang sedang berjalan.

Jadi tidak ada yang perlu ditekan. Paling lambat suaranya menyala saat
pengguna mulai menggulir halaman, dan itu pasti terjadi karena halamannya
memang panjang.

Tombol musik di kanan atas akan berdenyut halus selama suaranya masih
menunggu sentuhan, sebagai tanda bahwa lagunya sudah jalan.

**Tombol musik di kanan atas** berfungsi untuk membisukan, bukan menghentikan.
Saat dibisukan, lagunya tetap berjalan di latar belakang, jadi begitu
dinyalakan lagi suaranya langsung menyambung. Tampilan tombolnya:

| Keadaan | Tampilan |
|---|---|
| Musik berbunyi | Pink, tulisan "Musik: nyala" |
| Dibisukan | Putih, tulisan "Musik: bisu" |
| Belum berbunyi | Putih, tulisan "Musik: mati" |

---

### 9. Mengubah Warna Tema

Buka `css/style.css`, cari bagian `:root` di paling atas:

```css
:root {
  --pink-50: #fff0f5;
  --pink-100: #ffe4ef;
  --pink-200: #fbd9e5;
  ...
}
```

Ubah kode warnanya (format heksadesimal). Contoh tema biru:

```css
--pink-50: #f0f7ff;
--pink-100: #e4f0ff;
--pink-200: #d9e9fb;
```

> Karena semua warna memakai variabel ini, mengubah beberapa baris saja sudah
> cukup untuk mengganti seluruh tema halaman.

---

## Upload ke GitHub Pages

Supaya kartunya bisa dibuka lewat link dan dibagikan:

1. Buat repositori baru di [github.com/new](https://github.com/new)
   - Nama bebas, contoh `kartu-ulang-tahun`
   - Pilih **Public** (wajib untuk GitHub Pages gratis)
   - **Jangan** centang "Add a README file"

2. Upload semua berkas. Cara termudah lewat terminal:

   ```bash
   git init
   git add .
   git commit -m "Kartu ulang tahun"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

   Ganti `USERNAME` dengan nama pengguna GitHub-mu, dan `NAMA-REPO` dengan
   nama repositori yang tadi dibuat.

3. Aktifkan GitHub Pages:
   - Buka repositori → **Settings** → **Pages**
   - Pada **Source**, pilih **Deploy from a branch**
   - **Branch**: pilih `main`, folder `/ (root)`
   - Klik **Save**

4. Tunggu 1-2 menit, lalu buka:

   ```
   https://USERNAME.github.io/NAMA-REPO/
   ```

> **Catatan:** karena setiap orang punya link sendiri, sebaiknya ganti dulu
> nama dan fotonya sebelum upload, supaya tidak perlu push berkali-kali.

---

## Tips dan Catatan

**Kalau halaman tampil kosong atau berantakan**
Pastikan dibuka lewat server lokal, bukan klik dua kali pada `index.html`.
Cara paling mudah:

```bash
python -m http.server 8000
```

**Kalau tulisan berubah jadi kode aneh**
Simpan berkas `config.js` dengan encoding **UTF-8**. Di VS Code, lihat pojok
kanan bawah dan pastikan tertulis UTF-8.

**Kalau foto tidak muncul**
- Cek nama berkasnya sama persis, termasuk huruf besar/kecil
  (`kartu-foto.webp` berbeda dengan `Kartu-Foto.webp`)
- Pastikan berkasnya ada di folder `assets/`
- Coba refresh dengan `Ctrl + Shift + R` untuk membersihkan cache

**Kalau tanda kutip di dalam teks**
Gunakan tanda kutip tunggal, contoh: `"Jangan lupa bilang 'terima kasih'."`

**Kalau ingin teks memakai tanda kutip ganda**, tulis dengan garis miring:
`"Dia bilang \"halo\"."`

**Kalau ingin menghilangkan hiasan bunga**
Hapus bagian `<div class="bunga-pinggir ...">` di `index.html`. Ada 6 buah.

**Halaman selalu mulai dari atas**
Setiap kali halaman dibuka atau di-refresh (termasuk hard refresh), posisi
gulir dan lagunya kembali ke awal. Ini sudah diatur otomatis, tidak perlu
diapa-apakan.

**Animasi tidak muncul**
Ini normal bila di komputer pengguna mengaktifkan pengaturan "kurangi gerakan"
(reduce motion). Halaman tetap tampil utuh, hanya animasinya yang dimatikan.

**Menguji di HP tanpa upload**
Jalankan server lokal, cari alamat IP komputermu (misalnya `192.168.1.5`), lalu
buka `http://192.168.1.5:8000` di HP. Pastikan HP dan komputer tersambung ke
WiFi yang sama.

---

## Cara Menayangkan (Deploy)

Halaman ini berupa berkas statis, jadi bisa ditaruh di layanan apa pun yang
mendukung berkas statis. Pilih salah satu:

### Vercel (yang dipakai sekarang)

1. Pasang alatnya sekali saja:
   ```bash
   npm install -g vercel
   ```
2. Masuk ke akun Vercel:
   ```bash
   vercel login
   ```
3. Dari folder proyek, jalankan:
   ```bash
   vercel deploy --prod
   ```
4. Alamatnya langsung jadi, misalnya `https://template-birthday-1.vercel.app`

### GitHub Pages (gratis, tanpa alat tambahan)

1. Unggah proyek ini ke GitHub
2. Buka **Settings** lalu **Pages**
3. Pada bagian **Source**, pilih branch `main` dan folder `/ (root)`
4. Simpan. Alamatnya jadi `https://<nama-akun>.github.io/<nama-repo>/`

### Netlify (cara paling mudah tanpa kode)

1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Tarik seluruh folder proyek ini ke halaman itu
3. Selesai, alamatnya langsung jadi

> **Penting untuk semua layanan:** berkas `data/harapan.json` dibaca memakai
> `fetch`. Karena itu halaman harus dibuka lewat alamat `http` atau `https`,
> bukan dengan mengeklik dua kali berkas `index.html`. Semua layanan di atas
> sudah otomatis begitu.

---

## Lisensi

Bebas dipakai dan diubah untuk keperluan pribadi maupun komersial.
GSAP yang disertakan di `assets/vendor/` mengikuti
[lisensi GSAP](https://gsap.com/standard-license) dari GreenSock.

---

Dibuat dengan sepenuh hati. Selamat merayakan. 🎉
