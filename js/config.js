/* ═══════════════════════════════════════════════════════════════════════════
   KONFIGURASI

   SEMUA yang perlu kamu ubah ada di berkas ini. Kamu tidak perlu menyentuh
   berkas lain (index.html, css, atau js lainnya) untuk menyesuaikan template.

   PENTING: disimpan ke `window.BIRTHDAY`, bukan `const BIRTHDAY`.
   `const` di tingkat atas sebuah berkas TIDAK menjadi properti `window`,
   sehingga berkas lain (main.js, calendar.js) tidak bisa membacanya.
   ═══════════════════════════════════════════════════════════════════════════ */

window.BIRTHDAY = {
  /* ── Penerima ─────────────────────────────────────────────────────────── */
  nama: "masukkan_nama_panjang",
  panggilan: "masukkan_nama_panggilan",

  /* Angka umur yang dirayakan. Isi null bila tidak ingin ditampilkan. */
  umur: 17,

  /* ── Hero ─────────────────────────────────────────────────────────────── */
  judul: "Selamat Ulang Tahun",
  subjudul: "Hari istimewa untuk orang istimewa",
  tanggal: "31 Juli 2026",

  /* ── Ucapan (bagian yang muncul saat halaman digulir) ─────────────────── */
  ucapan: [
    {
      ikon: "01",
      judul: "Panjang Umur",
      isi: "Semoga panjang umur, sehat selalu, dan setiap langkahmu "
         + "dijauhkan dari hal-hal yang menyakitkan.",
    },
    {
      ikon: "02",
      judul: "Bahagia Selalu",
      isi: "Semoga hari-harimu dipenuhi hal-hal kecil yang membuatmu "
         + "tersenyum, bahkan saat sedang lelah.",
    },
    {
      ikon: "03",
      judul: "Mimpi Tercapai",
      isi: "Semoga semua yang sedang kamu perjuangkan menemukan jalannya. "
         + "Pelan-pelan saja, yang penting sampai.",
    },
    {
      ikon: "04",
      judul: "Dikelilingi Cinta",
      isi: "Semoga kamu selalu dikelilingi orang-orang yang tulus "
         + "menyayangimu, seperti kamu menyayangi mereka.",
    },
  ],

  /* ── Isi kartu ────────────────────────────────────────────────────────── */
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

  /* ── Penutup ──────────────────────────────────────────────────────────── */
  penutup: {
    judul: "Bahagia selalu",
    isi: "Tekan tombol di bawah untuk melihat sesuatu yang menakjubkan",
    tombol: "Lihat Kejutan!",
  },

  /* ── Kalender ─────────────────────────────────────────────────────────── */
  kalender: {
    /* null = pakai tahun berjalan. Isi angka untuk mengunci tahun tertentu. */
    tahun: 2026,
    bulan: 7,                     // 7 = Juli
    namaBulan: "Juli",
    /* Tanggal yang diberi tanda hati. Bisa lebih dari satu. */
    hariSpesial: [31],
  },

  /* ── Musik ────────────────────────────────────────────────────────────── */
  musik: {
    berkas: "assets/lagu.mp3",    // berkas lagunya
    auto: true,                   // true = coba putar sendiri saat halaman dibuka
    volume: 0.45,                 // 0 = sunyi, 1 = paling keras
    ulang: true,                  // true = lagu diputar berulang terus
  },
};
