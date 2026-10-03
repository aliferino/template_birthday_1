/* ═══════════════════════════════════════════════════════════════════════════
   KALENDER , kalender bergaya kertas prangko (tepi gelombang masuk ke dalam).

   Kalendernya dihitung dari JavaScript, jadi selalu cocok dengan bulan dan
   tahun yang diminta di config.js , tidak ada tanggal yang perlu ditulis
   manual, dan tidak akan pernah salah hari.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const D = window.BIRTHDAY;
  const adaGSAP = typeof window.gsap !== "undefined";

  /* Nama hari singkat. Minggu lebih dulu supaya sama dengan kalender dinding. */
  const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const NAMA_BULAN_PANJANG = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  /* ── Perhitungan tanggal ──────────────────────────────────────────────── */

  /* Hari pertama bulan itu jatuh pada hari apa (0 = Minggu). */
  function hariPertama(tahun, bulan) {
    return new Date(tahun, bulan - 1, 1).getDay();
  }

  /* Ada berapa hari di bulan itu. Hari ke-0 bulan berikutnya = hari terakhir. */
  function jumlahHari(tahun, bulan) {
    return new Date(tahun, bulan, 0).getDate();
  }

  /* Susun daftar petak kalender: null = petak kosong di awal. */
  function susunPetak(tahun, bulan) {
    const petak = [];
    const geser = hariPertama(tahun, bulan);
    const total = jumlahHari(tahun, bulan);

    for (let i = 0; i < geser; i++) petak.push(null);
    for (let t = 1; t <= total; t++) petak.push(t);

    // lengkapi sampai penuh satu minggu terakhir
    while (petak.length % 7 !== 0) petak.push(null);
    return petak;
  }

  /* ── Gambar kalender ke DOM ───────────────────────────────────────────── */
  function gambar() {
    const k = D.kalender;
    const tahun = k.tahun || new Date().getFullYear();
    const bulan = k.bulan;

    // judul bulan: pakai nama dari config bila ada
    const namaBulan = k.namaBulan || NAMA_BULAN_PANJANG[bulan - 1];
    const elBulan = document.getElementById("kalender-bulan");
    const elTahun = document.getElementById("kalender-tahun");
    if (elBulan) elBulan.textContent = namaBulan;
    if (elTahun) elTahun.textContent = String(tahun);

    const wadah = document.getElementById("kalender-petak");
    if (!wadah) return;

    /* Label pembaca layar ikut menyesuaikan bulan & tahun dari config,
       supaya tidak perlu diubah manual di index.html. */
    wadah.setAttribute("aria-label", `Kalender bulan ${namaBulan} ${tahun}`);

    const spesial = new Set(k.hariSpesial || []);
    const petak = susunPetak(tahun, bulan);

    /* Baris pertama: nama-nama hari. */
    let html = HARI.map((h) =>
      `<div class="kalender-nama-hari" role="columnheader">${h}</div>`
    ).join("");

    /* Baris tanggal. */
    let urutan = 0;
    petak.forEach((tgl) => {
      if (tgl === null) {
        html += '<div class="kalender-hari kosong" aria-hidden="true"></div>';
        return;
      }

      const tanggalLengkap = `${tgl} ${namaBulan} ${tahun}`;
      const hariKe = new Date(tahun, bulan - 1, tgl).getDay();
      const punyaHati = spesial.has(tgl);

      html += `
        <div class="kalender-hari${punyaHati ? " spesial" : ""}"
             role="gridcell"
             title="${tanggalLengkap} (${HARI[hariKe]})"
             aria-label="${tanggalLengkap}">
          <span class="kalender-angka" style="--i:${urutan}">${tgl}</span>
          ${punyaHati
            ? '<img class="kalender-hati" src="assets/heart-hand.svg"'
              + ' alt="tanggal istimewa" aria-hidden="true">'
            : ""}
        </div>`;
      urutan++;
    });

    wadah.innerHTML = html;

    // simpan untuk pemeriksaan otomatis
    document.body.dataset.kalender = JSON.stringify({
      tahun, bulan, namaBulan,
      jumlahHari: jumlahHari(tahun, bulan),
      hariPertama: HARI[hariPertama(tahun, bulan)],
      baris: petak.length / 7,
      spesial: [...spesial],
    });
  }

  /* ── Animasi ────────────────────────────────────────────────────────────
   * Angka tanggal dan tanda hati dianimasikan dengan CSS (@keyframes di
   * style.css), BUKAN di sini. Alasannya penting: kalau sebuah elemen
   * disembunyikan lalu hanya dimunculkan oleh ScrollTrigger, satu kegagalan
   * saja (GSAP gagal dimuat, trigger tidak menyala) membuat elemen itu
   * hilang selamanya. Tanggal dan hati adalah inti kalender ini, jadi
   * animasinya dibuat tanpa syarat.
   * ────────────────────────────────────────────────────────────────────── */
  function animasi() {
    if (!adaGSAP) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Buket lily: muncul dari kiri, sedikit berputar, lalu mengambang
     * naik-turun pelan seperti dipegang seseorang. */
    gsap.from(".kalender-buket", {
      x: -50, opacity: 0, rotate: -6, duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".kalender-baris", start: "top 82%" },
    });

    if (!kurangiGerak) {
      gsap.to(".kalender-buket", {
        y: -12, duration: 3.2, ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: 1.1,
      });
    }
  }

  window.BirthdayKalender = { gambar, animasi, susunPetak, jumlahHari, hariPertama };
})();
