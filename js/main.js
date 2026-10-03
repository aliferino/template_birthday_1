/* ═══════════════════════════════════════════════════════════════════════════
   HALAMAN , mengisi teks, animasi (GSAP), dan interaksi.

   ── Cara animasi digulir bekerja ─────────────────────────────────────────
   Memakai GSAP + ScrollTrigger dengan `toggleActions: "play none play reverse"`.

   Artinya animasinya BERJALAN DUA ARAH, bukan sekali saja:
     * menggulir ke bawah → elemen masuk dengan animasi
     * menggulir terus ke bawah (keluar dari atas) → elemen kembali ke awal
     * menggulir ke atas lagi → beranimasi masuk LAGI
     * keluar dari bawah → dibiarkan tampil

   Jadi setiap kali bagian itu masuk layar, animasinya selalu terlihat ,
   tidak seperti "animate on scroll" biasa yang hanya jalan sekali lalu mati.

   ── Penting: fromTo, bukan from ─────────────────────────────────────────
   Elemen-elemen ini sudah disembunyikan lebih dulu oleh CSS (aturan
   `.js .sesuatu { opacity: 0 }`). Karena itu `gsap.from()` TIDAK bisa dipakai:
   `from()` membaca keadaan CSS saat itu (opacity 0) sebagai nilai AKHIR,
   sehingga animasinya jadi 0 → 0 dan tidak terlihat sama sekali.
   Maka di sini selalu dipakai `gsap.fromTo()` dengan nilai awal DAN akhir
   yang ditulis eksplisit.

   ── Jaring pengaman ─────────────────────────────────────────────────────
   Bila GSAP gagal dimuat, class "js" dihapus sehingga semua elemen yang
   tadinya disembunyikan CSS langsung tampil. Halaman tidak pernah kosong.
   GSAP dimuat dari berkas lokal (assets/vendor), jadi tidak butuh internet.

   Struktur:
     1. isiHalaman()      , tulis teks dari config.js ke DOM
     2. siapkanHero()     , animasi pembuka
     3. siapkanScroll()   , animasi dua arah saat digulir
     4. siapkanKartu()   , kartu muncul saat digulir
     5. siapkanConfetti() , perayaan saat tombol ditekan
     6. siapkanMusik()    , tombol musik Happy Birthday
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const D = window.BIRTHDAY;
  const adaGSAP = typeof window.gsap !== "undefined";
  const adaST = typeof window.ScrollTrigger !== "undefined";
  const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Animasi hanya jalan bila GSAP + ScrollTrigger ada dan pengguna tidak
     meminta "kurangi gerakan". Kalau tidak, halaman ditampilkan apa adanya. */
  const pakaiGSAP = adaGSAP && adaST && !kurangiGerak;

  if (adaGSAP && adaST) gsap.registerPlugin(ScrollTrigger);

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* Aksi dua arah untuk semua ScrollTrigger di halaman ini.
   *   onEnter     → mainkan animasi masuk
   *   onLeave     → biarkan (jangan balik saat keluar dari bawah)
   *   onEnterBack → mainkan animasi masuk LAGI saat digulir balik ke atas
   *   onLeaveBack → kembalikan ke keadaan awal saat keluar dari atas
   * Dengan begini animasinya selalu terlihat, ke arah mana pun digulir. */
  const DUA_ARAH = "play none play reverse";

  /* Layar sempit? Di ponsel, animasi yang menggeser elemen ke KIRI/KANAN
     harus dihindari: geseran itu membuat isi halaman melebar keluar layar
     (muncul guliran mendatar). Di ponsel animasinya dibuat naik-turun saja. */
  function layarSempit() {
    return window.innerWidth <= 720;
  }

  /* Pengaturan singkat untuk ScrollTrigger dua arah. */
  function pemicu(el) {
    return {
      trigger: el,
      start: "top 88%",
      end: "bottom 12%",
      toggleActions: DUA_ARAH,
    };
  }

  /* ── 1. Isi halaman dari config ───────────────────────────────────────── */
  function isiHalaman() {
    document.title = "Selamat Ulang Tahun, " + D.panggilan;

    $("#hero-nama").textContent = D.nama;
    $("#hero-judul").textContent = D.judul;
    $("#hero-sub").textContent = D.subjudul;
    $("#hero-tanggal").textContent = D.tanggal;
    $("#hero-umur").textContent = D.umur ? "yang ke-" + D.umur : "";

    const wadah = $("#daftar-ucapan");
    wadah.innerHTML = D.ucapan.map((u) => `
      <article class="ucapan">
        <div class="ucapan-ikon" aria-hidden="true">${u.ikon}</div>
        <h3 class="ucapan-judul">${u.judul}</h3>
        <p class="ucapan-isi">${u.isi}</p>
      </article>
    `).join("");

    $("#kartu-pembuka").textContent = D.kartu.pembuka;
    $("#kartu-isi").innerHTML = D.kartu.isi.map((p) => `<p>${p}</p>`).join("");
    $("#kartu-penutup").textContent = D.kartu.penutup;
    $("#kartu-pengirim").textContent = D.kartu.pengirim;

    $("#penutup-judul").textContent = D.penutup.judul;
    $("#penutup-isi").textContent = D.penutup.isi;
    $("#tombol-kejutan").textContent = D.penutup.tombol;
  }

  /* ── 2. Hero ──────────────────────────────────────────────────────────── */
  function siapkanHero() {
    if (!pakaiGSAP) return;

    /* Bila layar kado dipakai, animasi hero ditahan dulu. Kalau tidak, ia
       sudah selesai berjalan di balik layar kado, dan pengguna tidak sempat
       melihatnya. Animasi baru dijalankan setelah kadonya diklik. */
    const layarKado = document.getElementById("pembuka");
    if (layarKado && !layarKado.hasAttribute("hidden")) {
      window.addEventListener("halaman-dibuka", () => jalankanHero(), { once: true });

      /* Jaring pengaman: bila karena satu dan lain hal peristiwanya tidak
         sampai, animasinya tetap dijalankan setelah 6 detik. */
      window.setTimeout(() => {
        if (!document.body.classList.contains("terkunci")) jalankanHero();
      }, 6000);
      return;
    }

    jalankanHero();
  }

  /* Animasi masuknya hero. Dipisah supaya bisa dipanggil kapan saja, baik
     langsung saat halaman siap maupun setelah kado diklik. */
  let heroSudahJalan = false;
  function jalankanHero() {
    if (!pakaiGSAP || heroSudahJalan) return;
    heroSudahJalan = true;

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });

    tl.fromTo("#hero-bunga-atas",
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1 })
      .fromTo(".hero-baris",
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.13 }, "-=0.75")
      .fromTo(".hero-kue",
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }, "-=0.55")
      .fromTo("#gulir-petunjuk",
        { opacity: 0 },
        { opacity: 1, duration: 0.6 }, "-=0.4");

    /* Chibi Maruko bergoyang pelan terus-menerus.
       Putarannya di <img>, bukan di pembungkusnya, supaya tidak bentrok
       dengan animasi scale/opacity di atas. */
    gsap.to("#hero-bunga-atas img", {
      rotate: 4, duration: 3.4, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "50% 100%",
    });

    gsap.to(".hero-cahaya", {
      opacity: 0.75, scale: 1.08, duration: 4.5,
      ease: "sine.inOut", yoyo: true, repeat: -1,
    });
  }

  /* ── 3. Animasi dua arah saat digulir ─────────────────────────────────── */
  function siapkanScroll() {
    if (!pakaiGSAP) return;

    /* Judul tiap bagian: muncul naik, berulang tiap kali masuk layar. */
    $$(".bagian-judul").forEach((el) => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: pemicu(el) });
    });

    /* Sub-judul menyusul judulnya. */
    $$(".bagian-kecil").forEach((el) => {
      gsap.fromTo(el,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, scrollTrigger: pemicu(el) });
    });

    /* Kartu ucapan pada timeline vertikal: semuanya masuk dari arah yang
       SAMA (dari garis timeline ke kanan). Arah bergantian kiri-kanan tidak
       dipakai lagi karena membuat kartunya tidak sejajar satu sama lain.
       Di ponsel cukup naik-turun , geseran mendatar melebarkan halaman. */
    $$(".ucapan").forEach((el) => {
      const geserX = layarSempit() ? 0 : -44;
      gsap.fromTo(el,
        { x: geserX, y: 26, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: pemicu(el) });
    });

    /* Kartu: naik muncul saat bagiannya masuk layar. Karena elemennya juga
       disembunyikan CSS (.js .kartu-wadah { opacity: 0 }), dipakai fromTo. */
    gsap.fromTo(".kartu-wadah",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: pemicu($(".kartu-wadah")) });

    /* Penutup: bunga → judul → isi → tombol → kaki. */
    const tlAkhir = gsap.timeline({ scrollTrigger: pemicu($(".penutup")) });

    tlAkhir
      .fromTo(".penutup-bunga",
        { scale: 0.4, rotate: -18, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.75, ease: "back.out(1.8)" })
      .fromTo("#penutup-judul",
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }, "-=0.45")
      .fromTo("#penutup-isi",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }, "-=0.5")
      .fromTo("#tombol-kejutan",
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)" }, "-=0.35");

    /* Toples Harapan: toples masuk lebih dulu, kertas hasilnya menyusul. */
    gsap.fromTo(".toples",
      { y: 34, opacity: 0, rotate: -6 },
      { y: 0, opacity: 1, rotate: 0, duration: 0.85, ease: "back.out(1.6)",
        scrollTrigger: pemicu($(".toples")) });

    gsap.fromTo(".toples-hasil",
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.12, ease: "power3.out",
        scrollTrigger: pemicu($(".toples-hasil")) });

    gsap.fromTo(".tombol-kocok",
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)",
        scrollTrigger: pemicu($(".tombol-kocok")) });

    /* Footer: muncul terakhir. */
    gsap.fromTo(".kaki",
      { opacity: 0 },
      { opacity: 1, duration: 0.7, scrollTrigger: pemicu($(".kaki")) });

    /* ── Kalender ──────────────────────────────────────────────────────────
     * Buket muncul dari KANAN ke KIRI. Karena kalender ada di kanan dan
     * tepi kanan buket terselip di belakangnya (z-index buket lebih rendah),
     * gerakan ini membuat buket seolah keluar dari balik kalender.
     *
     * Pemicunya SENGAJA dibuat lebih telat daripada bagian lain: baru mulai
     * ketika ±75% tinggi bagian kalender sudah masuk layar, supaya gerakan
     * keluarnya terlihat jelas , bukan muncul begitu bagiannya menyentuh layar.
     *
     * Tanggal dan tanda hati TIDAK dianimasikan di sini: keduanya memakai
     * animasi CSS (lihat style.css) supaya selalu tampil walau GSAP bermasalah. */
    const buket = $(".kalender-buket");
    const barisKalender = $(".kalender-baris");

    /* Hitung titik mulai: saat ±75% tinggi bagian sudah masuk layar.
     * Dihitung dari tinggi sebenarnya (bukan angka mati), supaya tetap pas
     * di layar besar maupun kecil.
     *   bagian terlihat 75%  →  top bagian berada di (tinggiLayar − 0,75×tinggiBagian)
     */
    function mulaiBuket() {
      const tinggiBagian = barisKalender.offsetHeight || 1;
      const tinggiLayar = window.innerHeight || 1;
      const titik = Math.max(0, tinggiLayar - 0.75 * tinggiBagian);
      return "top " + Math.round(titik) + "px";
    }

    /* ── Animasi masuk buket ───────────────────────────────────────────────
     * DESKTOP/TABLET: buket ada di SAMPING KIRI kalender. Ia muncul dari
     *   KANAN ke KIRI , tepi kanannya terselip di belakang kertas kalender,
     *   jadi seolah buket keluar dari balik kalender.
     *
     * PONSEL: buket ada di ATAS kalender, jadi arahnya diganti menjadi
     *   DARI BAWAH KE ATAS , efeknya sama: naik dari balik kalender.
     *   Jarak gesernya dihitung dari posisi sebenarnya supaya buket
     *   benar-benar tersembunyi di belakang kertas sebelum animasi mulai.
     *   Opasitas sengaja tetap 1 (tidak memudar): yang menyembunyikannya
     *   adalah kertas kalender, bukan fade , jadi terlihat benar-benar
     *   "keluar dari belakang kalender".
     */
    function geserAwalBuket() {
      if (!layarSempit()) return { xPercent: 90, opacity: 0 };

      const rBuket = buket.getBoundingClientRect();
      const rKal = $(".kalender-bungkus").getBoundingClientRect();
      /* Turunkan buket sampai lewat tepi atas kalender, + sedikit ekstra
         supaya tidak ada bagian yang menyembul sebelum animasi mulai. */
      const jarak = Math.max(80, Math.round(rKal.top - rBuket.top + rBuket.height * 0.12));
      return { y: jarak, opacity: 1 };
    }

    gsap.fromTo(buket,
      geserAwalBuket(),
      {
        xPercent: 0, y: 0, yPercent: 0, opacity: 1, duration: 1.3, ease: "power3.out",
        scrollTrigger: {
          trigger: barisKalender,
          start: mulaiBuket,
          end: "bottom 12%",
          toggleActions: DUA_ARAH,
        },
      });

    /* Buket mengambang pelan. Animasi ini ditaruh di <img> di dalamnya,
     * bukan di pembungkusnya, supaya tidak bentrok dengan gerakan masuk
     * (xPercent/opacity) yang berjalan di pembungkusnya. */
    gsap.to(".kalender-buket img", {
      yPercent: -3, duration: 3.2, ease: "sine.inOut",
      yoyo: true, repeat: -1, delay: 1.4,
    });

    /* ── Bunga di sisi halaman ─────────────────────────────────────────────
     * Dua animasi sekaligus:
     *   1. PARALLAX , bergerak lebih lambat dari guliran (scrub).
     *   2. MASUK DARI SAMPING , setiap kali ARAH guliran berubah, bunga
     *      meluncur masuk dari sisinya sendiri: yang di kiri datang dari
     *      kiri, yang di kanan datang dari kanan. Jadi bukan cuma naik-turun,
     *      dan animasinya berulang tiap kali arah guliran berubah.
     *
     * Arah guliran dideteksi sendiri lewat event "scroll" , lebih andal
     * daripada onUpdate ScrollTrigger untuk elemen yang selalu di layar.
     */
    const bungaEls = $$(".bunga-pinggir");

    /* Simpan opasitas dasar tiap bunga (0.85 / 0.7 / 0.6 dari CSS),
       supaya animasi fade berakhir di nilai aslinya, bukan selalu 1. */
    bungaEls.forEach((el) => {
      el.__op = parseFloat(getComputedStyle(el).opacity) || 1;
    });

    function bungaMasuk() {
      const sempit = layarSempit();
      bungaEls.forEach((el) => {
        const dariKiri = el.dataset.arah !== "kanan";
        /* Di ponsel bunga cukup memudar masuk (tanpa geseran mendatar),
           supaya halaman tidak melebar keluar layar. */
        const geser = sempit ? 0 : (dariKiri ? -160 : 160);
        gsap.fromTo(el,
          { x: geser, opacity: 0 },
          {
            x: 0,
            opacity: el.__op,
            duration: sempit ? 0.7 : 1.05,
            ease: "power3.out",
            overwrite: "auto",
          });
      });
    }

    /* Parallax: gerak lambat sepanjang halaman. */
    bungaEls.forEach((el) => {
      const arah = el.dataset.arah === "kanan" ? 1 : -1;
      gsap.fromTo(el,
        { yPercent: 6 * arah },
        { yPercent: -14 * arah, ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top", end: "bottom bottom",
            scrub: 1,
          } });
    });

    /* Bunga dibiarkan terlihat saat halaman diam (jadi tepi halaman tidak
       pernah kosong). Begitu pengguna mulai menggulir, bunga meluncur masuk
       dari sisinya; dan setiap kali arah guliran berbalik, terulang lagi. */
    let posisiTerakhir = window.scrollY;
    let arahTerakhir = 0;

    window.addEventListener("scroll", () => {
      const posisi = window.scrollY;
      const arah = posisi > posisiTerakhir ? 1 : (posisi < posisiTerakhir ? -1 : 0);
      posisiTerakhir = posisi;

      if (arah !== 0 && arah !== arahTerakhir) {
        arahTerakhir = arah;
        bungaMasuk();
      }
    }, { passive: true });

    /* Segarkan posisi setelah semua gambar selesai dimuat, supaya
     * perhitungan ScrollTrigger tidak meleset karena tinggi halaman berubah. */
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ── 4. Amplop → Kartu ───────────────────────────────────────────────────
   Di awal yang tampil adalah AMPLOP. Saat ditekan, amplop TIDAK terbuka
   seperti tutup yang mengangkat , ia memudar lalu menghilang, dan di
   tempat yang sama kartu muncul menggantikannya.

   Semua dijalankan lewat kelas "terbuka" pada .kartu-wadah, dan animasinya
   memakai CSS transition (lihat style.css). Jadi tetap jalan walau GSAP
   gagal dimuat , tidak ada isi yang hilang. */
  function siapkanKartu() {
    const wadah = $("#kartu-wadah");
    const amplop = $("#amplop");
    const kartu = $("#kartu");
    if (!wadah || !amplop || !kartu) return;

    let terbuka = false;

    /* Kartu diposisikan absolute, jadi ia tidak menambah tinggi wadahnya
       sendiri. Tinggi wadah karena itu diatur di sini dalam satuan px:
       setinggi amplop lebih dulu, lalu setinggi kartu setelah ditekan.
       Dipakai px langsung (bukan variabel CSS) supaya transisinya benar-benar
       dianimasikan oleh CSS , dengan var() tingginya lompat di sebagian browser. */
    function tinggiAmplop() {
      return amplop.offsetHeight || Math.round(wadah.offsetWidth * 0.625);
    }

    function pasangTinggi(tinggi) {
      wadah.style.height = Math.round(tinggi) + "px";
    }

    pasangTinggi(tinggiAmplop());

    function ganti() {
      if (terbuka) return;
      terbuka = true;

      /* Ukur tinggi kartu yang sebenarnya (teksnya panjang-pendek tergantung
         lebar layar), lalu pasang. Karena satuannya px, CSS transition
         menganimasikannya dengan halus. */
      pasangTinggi(kartu.offsetHeight);

      wadah.classList.add("terbuka");
      const bagian = wadah.closest(".bagian-kartu");
      if (bagian) bagian.classList.add("terbuka");

      kartu.removeAttribute("aria-hidden");
      kartu.setAttribute("tabindex", "-1");
      kartu.focus({ preventScroll: true });

      /* Petunjuk "Tekan amplop…" dimatikan. Dipasang langsung sebagai
         inline-important karena GSAP menulis opacity inline pada elemen
         .bagian-kecil , aturan CSS biasa akan kalah olehnya. */
      const petunjuk = $("#amplop-petunjuk");
      if (petunjuk) petunjuk.style.setProperty("opacity", "0", "important");

      /* Bunga kecil sebagai tanda kartunya terbuka. */
      if (window.__confetti) window.__confetti.ledakan(0.8);

      /* Bila GSAP tersedia, beri sentuhan pegas halus pada kartunya.
         CSS transition tetap yang menyelesaikan keadaan akhirnya. */
      if (pakaiGSAP) {
        gsap.fromTo(kartu,
          { y: 22 },
          { y: 0, duration: 0.85, ease: "back.out(1.4)", overwrite: "auto" });
      }
    }

    amplop.addEventListener("click", ganti);
    amplop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ganti(); }
    });

    /* Bila jendela diubah ukurannya, tinggi keduanya bisa berubah. */
    window.addEventListener("resize", () => {
      requestAnimationFrame(() => {
        if (!terbuka) pasangTinggi(tinggiAmplop());
        else pasangTinggi(kartu.offsetHeight);
      });
    }, { passive: true });
  }

  /* ── 5. Ledakan bunga ─────────────────────────────────────────────────────
   Saat tombol "Lihat Kejutan!" ditekan, yang beterbangan adalah GAMBAR BUNGA ASLI
   (assets/bunga-matahari.webp & assets/bunga-lily.webp) , bukan kelopak SVG
   atau kotak warna. Gambarnya dimuat sekali di awal lalu digambar berulang
   di kanvas, jadi tetap ringan.

   Kalau gambar gagal dimuat, otomatis kembali ke kelopak warna sederhana
   supaya tombolnya tidak pernah "tidak melakukan apa-apa". */
  function siapkanConfetti() {
    const cv = $("#confetti");
    const ctx = cv.getContext("2d");

    const WARNA = ["#f5b8cc", "#e890b0", "#f8c8d8", "#d88aa8",
      "#ffd9e6", "#fff2f7", "#f5e6a8", "#ffffff"];

    /* Bunga yang dipakai untuk ledakan: lima jenis, supaya semburannya
       terasa beragam. */
    const BERKAS_BUNGA = [
      "assets/bunga-cosmos.webp",
      "assets/bunga-plumeria.webp",
      "assets/bunga-daisy.webp",
      "assets/bunga-lily.webp",
      "assets/bunga-matahari.webp",
    ];
    const gambar = [];        // gambar yang sudah siap dipakai
    let adaGambar = false;    // true bila minimal satu gambar berhasil dimuat

    BERKAS_BUNGA.forEach((src, i) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        gambar[i] = im;
        adaGambar = true;
      };
      im.onerror = () => { gambar[i] = null; };
      im.src = src;
    });

    let serpihan = [];
    let jalan = false;
    let terakhir = 0;

    function ukur() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      cv.style.width = window.innerWidth + "px";
      cv.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ukur();
    window.addEventListener("resize", ukur);

    /* Pilih satu jenis bunga secara acak , hanya dari gambar yang sudah
       berhasil dimuat, supaya tidak ada slot kosong. */
    function pilihBunga() {
      const siap = [];
      for (let i = 0; i < gambar.length; i++) if (gambar[i]) siap.push(i);
      if (!siap.length) return -1;
      return siap[Math.floor(Math.random() * siap.length)];
    }

    function ledakan(kekuatan) {
      if (kurangiGerak) return;
      const k = kekuatan || 1;
      const n = Math.round(26 * k);          // jumlah bunga (bukan 110 serpihan)
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.62;

      for (let i = 0; i < n; i++) {
        const sudut = Math.random() * Math.PI * 2;
        const laju = 4 + Math.random() * 11;

        /* Ukuran bunga bervariasi; yang lebih kecil terlihat lebih jauh. */
        const sisi = 26 + Math.random() * 44;

        serpihan.push({
          x: cx + (Math.random() - 0.5) * 110,
          y: cy + (Math.random() - 0.5) * 60,
          vx: Math.cos(sudut) * laju,
          vy: Math.sin(sudut) * laju - 5,
          w: sisi,
          h: sisi,
          sudut: Math.random() * Math.PI,
          putar: (Math.random() - 0.5) * 0.26,
          hidup: 1,
          /* lambat memudar supaya bunganya sempat terlihat jelas */
          pudar: 0.26 + Math.random() * 0.14,
          /* pilih satu jenis bunga secara acak dari yang berhasil dimuat */
          idx: adaGambar ? pilihBunga() : -1,
          warna: WARNA[Math.floor(Math.random() * WARNA.length)],
        });
      }
      if (!jalan) { jalan = true; terakhir = performance.now(); requestAnimationFrame(loop); }
    }

    function loop(now) {
      const dt = Math.min(0.05, (now - terakhir) / 1000);
      terakhir = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const s of serpihan) {
        s.vy += 24 * dt;              // gravitasi lembut
        s.vx *= 0.993;                // gesekan udara
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;
        s.sudut += s.putar;
        s.hidup -= dt * s.pudar;

        const alfa = Math.max(0, Math.min(1, s.hidup));

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.sudut);
        ctx.globalAlpha = alfa;

        const g = s.idx >= 0 ? gambar[s.idx] : null;
        if (g) {
          /* gambar bunga asli */
          ctx.drawImage(g, -s.w / 2, -s.h / 2, s.w, s.h);
        } else {
          /* cadangan: kelopak bulat warna */
          ctx.fillStyle = s.warna;
          ctx.beginPath();
          ctx.arc(0, 0, s.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      serpihan = serpihan.filter((s) => s.hidup > 0 && s.y < window.innerHeight + 120);
      ctx.globalAlpha = 1;

      if (serpihan.length) requestAnimationFrame(loop);
      else { jalan = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }

    window.__confetti = { ledakan };
  }

  /* ── 6. Musik ─────────────────────────────────────────────────────────── */
  function siapkanMusik() {
    const btn = $("#tombol-musik");
    const ikon = $("#musik-ikon");
    const teks = $("#musik-teks");

    /* Penanda supaya keterangan "sentuh halaman" hanya diberikan sekali. */
    let sudahBeriTahu = false;

    if (typeof window.BirthdayMusik === "undefined") {
      btn.style.display = "none";
      return;
    }

    const musik = new window.BirthdayMusik({
      berkas: D.musik.berkas,
      volume: D.musik.volume,
      ulang: D.musik.ulang,
      onStateChange: (s) => {
        /* Tombol menunjukkan keadaan yang sebenarnya. */
        if (s.gagal) {
          btn.classList.remove("aktif", "bisu");
          ikon.textContent = "🔇";
          teks.textContent = "Musik: gagal dimuat";
          btn.disabled = true;
          return;
        }

        btn.classList.toggle("aktif", s.aktif && !s.bisu);
        btn.classList.toggle("bisu", s.bisu || s.menungguSentuhan);
        btn.setAttribute("aria-pressed", s.aktif && !s.bisu ? "true" : "false");

        if (!s.aktif) {
          ikon.textContent = "🔇";
          teks.textContent = "Musik: mati";
        } else if (s.bisu) {
          ikon.textContent = "🔇";
          teks.textContent = "Musik: bisu";
        } else {
          ikon.textContent = "🔊";
          teks.textContent = "Musik: nyala";
        }

        /* Beri tahu sekali saja, supaya pengguna tidak bingung kenapa
           belum terdengar padahal tombolnya sudah aktif. */
        if (s.menungguSentuhan && !sudahBeriTahu) {
          sudahBeriTahu = true;
          btn.title = "Sentuh halaman sekali agar suaranya menyala";
          btn.classList.add("denyut-perhatian");
        } else if (!s.menungguSentuhan && sudahBeriTahu) {
          btn.title = "Nyalakan atau bisukan lagu";
          btn.classList.remove("denyut-perhatian");
        }
      },
    });

    btn.addEventListener("click", () => musik.toggle());

    /* Dibagikan ke window supaya js/pembuka.js bisa menyalakan suaranya
       tepat saat kado diklik, dan supaya tombol di kanan atas ikut
       menampilkan keadaan yang benar. */
    window.__musik = musik;

    /* Jalankan lagunya saat halaman dibuka.
       Bila browser memblokir suara otomatis, lagunya tetap berjalan dalam
       keadaan bisu dan suaranya menyala pada sentuhan pertama.

       Bila layar kado dipakai, pemutaran di sini DILEWATI. Alasannya dua:
         1. play() di dalam penangan klik kado jauh lebih pasti diizinkan
            browser, jadi tidak perlu mengandalkan cara bisu.
         2. Lagunya mulai dari detik 0 tepat saat halaman terlihat, bukan
            sudah berjalan di balik layar kado.
       Pemutarannya dilakukan js/pembuka.js. */
    const adaKado = document.getElementById("pembuka");
    if (D.musik.auto && !adaKado) musik.mulai();
  }

  /* ── 7. Tombol "Lihat Kejutan!" ─────────────────────────────────────────────── */
  function siapkanKejutan() {
    const btn = $("#tombol-kejutan");
    btn.addEventListener("click", () => {
      if (window.__confetti) window.__confetti.ledakan(1.6);
      if (pakaiGSAP) {
        gsap.fromTo("#penutup-judul",
          { scale: 1 },
          { scale: 1.07, duration: 0.35, yoyo: true, repeat: 1, ease: "power2.inOut" });
      }
    });
  }

  /* ── 8. Toples Harapan ──────────────────────────────────────────────────
   Isi harapannya TIDAK ditulis di sini, melainkan diambil dari
   data/harapan.json. Dengan begitu berkas ini tetap ringan dan harapannya
   bisa ditambah atau diubah tanpa menyentuh kode.

   Cara kerjanya:
     - saat halaman dibuka, JSON diambil sekali lalu disimpan di memori
     - tombol ditekan, toples "dikocok" sebentar, lalu satu harapan dipilih
       secara ACAK. Harapan yang baru saja keluar dicatat supaya tidak
       langsung terulang, sehingga urutannya tidak pernah sama. */
  function siapkanToples() {
    const tombol = $("#tombol-kocok");
    const panggung = $(".toples-panggung");
    if (!tombol || !panggung) return;

    const kertas = $("#toples-kertas");
    const hasil = $("#toples-hasil");
    const teks = $("#toples-teks");
    const teksTombol = $("#tombol-kocok-teks");

    let daftar = [];        // seluruh harapan
    let terakhir = -1;      // indeks kata yang terakhir keluar
    let sibuk = false;      // cegah tombol ditekan berkali-kali sekaligus

    /* Isi toples dengan kertas kecil.
       Posisi, ukuran, dan putarannya diacak supaya terlihat seperti kertas
       yang benar-benar dituang ke dalam toples, bukan barisan yang tertata.
       Warnanya hanya putih, pink, dan kuning agar serasi dengan halaman. */
    const WARNA_KERTAS = [
      "linear-gradient(150deg, #ffffff 0%, #fff2f7 100%)",
      "linear-gradient(150deg, #fff6fa 0%, #ffe0ec 100%)",
      "linear-gradient(150deg, #ffeaf3 0%, #fbd0e2 100%)",
      "linear-gradient(150deg, #fffdf2 0%, #fdf0c4 100%)",
      "linear-gradient(150deg, #fffaea 0%, #fbe6a8 100%)",
      "linear-gradient(150deg, #ffeef4 0%, #fbd9e5 100%)",
    ];

    if (kertas) {
      const banyak = layarSempit() ? 26 : 40;
      let html = "";

      for (let i = 0; i < banyak; i++) {
        /* Makin ke atas makin jarang, supaya bagian bawah terlihat padat
           seperti toples yang terisi sampai setengah. */
        const acak = Math.random();
        const dariBawah = Math.pow(acak, 0.62);          // 0 = dasar, 1 = atas
        const bawah = 4 + dariBawah * 62;                // % dari dasar toples
        const kiri = 6 + Math.random() * 80;             // % dari kiri
        const putar = (Math.random() - 0.5) * 62;        // -31..31 derajat
        const lebar = 15 + Math.random() * 11;           // 15..26 px
        const tinggi = lebar * (0.62 + Math.random() * 0.16);
        const warna = WARNA_KERTAS[Math.floor(Math.random() * WARNA_KERTAS.length)];
        const redup = 0.86 + Math.random() * 0.14;

        html += '<i style="' +
          "left:" + kiri.toFixed(1) + "%;" +
          "bottom:" + bawah.toFixed(1) + "%;" +
          "width:" + lebar.toFixed(1) + "px;" +
          "height:" + tinggi.toFixed(1) + "px;" +
          "background:" + warna + ";" +
          "opacity:" + redup.toFixed(2) + ";" +
          "transform:rotate(" + putar.toFixed(1) + "deg);" +
          '"></i>';
      }
      kertas.innerHTML = html;
    }

    hasil.classList.add("kosong");

    /* Ambil daftar katanya. */
    fetch("data/harapan.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || !data.length) throw new Error("kosong");
        daftar = data.filter((x) => typeof x === "string" && x.trim());
      })
      .catch(() => {
        /* Bila berkas JSON gagal dimuat, tombol dimatikan dengan pesan yang
           jelas. Lebih baik begitu daripada tombol yang ditekan tanpa hasil. */
        tombol.disabled = true;
        hasil.classList.add("kosong");
        teks.textContent = "Buka halaman ini lewat server lokal agar harapannya bisa dimuat.";
      });

    /* Pilih indeks acak, usahakan tidak sama dengan yang baru keluar. */
    function pilihAcak() {
      if (daftar.length === 1) return 0;
      let i;
      do {
        i = Math.floor(Math.random() * daftar.length);
      } while (i === terakhir);
      return i;
    }

    /* Ambil elemen yang dipakai animasi. */
    const toplesEl = $("#toples");
    const terbang = $("#toples-terbang");

    /* Hitung pergeseran dari mulut toples ke tengah kartu, dalam piksel.
       Dihitung saat itu juga supaya tetap tepat di ukuran layar mana pun. */
    function jarakKeKartu() {
      if (!toplesEl || !hasil) return { x: 120, y: -40 };
      const a = toplesEl.getBoundingClientRect();
      const b = hasil.getBoundingClientRect();
      return {
        x: (b.left + b.width / 2) - (a.left + a.width / 2),
        y: (b.top + b.height / 2) - (a.top + 12),
      };
    }

    function kocok() {
      if (sibuk || !daftar.length) return;
      sibuk = true;

      tombol.disabled = true;
      tombol.classList.add("kocok");
      if (teksTombol) teksTombol.textContent = "Mengocok...";

      hasil.classList.remove("kosong");
      hasil.classList.add("kocok");

      /* Tutup toples dibuka dulu. */
      if (toplesEl) {
        toplesEl.classList.remove("tertutup-lagi");
        toplesEl.classList.add("terbuka");
      }

      /* Getarkan toplesnya saat dikocok. */
      if (pakaiGSAP && !kurangiGerak) {
        gsap.fromTo(".toples",
          { rotate: 0 },
          { rotate: 8, duration: 0.09, yoyo: true, repeat: 7, ease: "power1.inOut",
            onComplete: () => gsap.set(".toples", { rotate: 0 }) });
        gsap.fromTo(".toples-kertas i",
          { y: 0 },
          { y: -6, duration: 0.12, yoyo: true, repeat: 5, ease: "power1.inOut",
            stagger: { each: 0.012, from: "random" } });
      }

      /* Beri jeda supaya efek "dikocok" terasa, baru kertasnya keluar. */
      const jeda = kurangiGerak ? 0 : 700;

      window.setTimeout(() => {
        const i = pilihAcak();
        terakhir = i;

        /* ── Kertas terbang dari toples ke kartu ────────────────────────────
           Kertas kecil meluncur dari mulut toples menuju tengah kartu, lalu
           memudar tepat saat isi kartunya muncul. Jadi terlihat seperti
           kertasnya benar-benar berpindah dari toples ke kartu. */
        const lanjut = () => {
          teks.textContent = daftar[i];

          hasil.classList.remove("kocok");
          tombol.classList.remove("kocok");
          tombol.disabled = false;
          if (teksTombol) teksTombol.textContent = "Kocok Lagi";
          sibuk = false;

          /* Tutup toplesnya kembali. */
          if (toplesEl) {
            toplesEl.classList.remove("terbuka");
            toplesEl.classList.add("tertutup-lagi");
          }

          /* Isi kartu muncul dengan lembut. */
          if (pakaiGSAP && !kurangiGerak) {
            gsap.fromTo(hasil,
              { scale: 0.96, opacity: 0.35 },
              { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)" });
            gsap.fromTo(teks,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.5, delay: 0.06, ease: "power2.out" });
          }
        };

        if (pakaiGSAP && !kurangiGerak && terbang) {
          const jauh = jarakKeKartu();

          /* Kertas muncul di mulut toples, lalu melengkung ke arah kartu. */
          gsap.set(terbang, { x: 0, y: 0, scale: 1, rotate: 0, opacity: 0 });

          gsap.timeline({ onComplete: () => gsap.set(terbang, { opacity: 0 }) })
            .to(terbang, { opacity: 1, duration: 0.12 })
            .to(terbang, {
              x: jauh.x * 0.42,
              y: jauh.y * 0.62 - 54,      /* melengkung naik dulu */
              rotate: -22,
              scale: 1.18,
              duration: 0.42,
              ease: "power2.out",
            })
            .to(terbang, {
              x: jauh.x,
              y: jauh.y,
              rotate: 14,
              scale: 0.82,
              opacity: 0.15,
              duration: 0.34,
              ease: "power2.in",
            })
            /* Isi kartu muncul tepat saat kertas menyentuhnya. */
            .add(lanjut);
        } else {
          /* Tanpa GSAP: langsung tampilkan isinya, tanpa animasi. */
          lanjut();
        }
      }, jeda);
    }

    tombol.addEventListener("click", kocok);
  }

  /* ── 9. Petunjuk gulir ────────────────────────────────────────────────── */
  function siapkanPetunjukGulir() {
    const el = $("#gulir-petunjuk");
    if (!el) return;
    const sembunyikan = () => {
      if (window.scrollY > 60) el.classList.add("sembunyi");
      else el.classList.remove("sembunyi");
    };
    window.addEventListener("scroll", sembunyikan, { passive: true });
    sembunyikan();
  }

  /* ── Jalankan semuanya ────────────────────────────────────────────────── */
  function mulai() {
    /* Lapis kedua pengunci posisi gulir. Yang utama ada di <head> index.html,
       karena harus dijalankan sebelum browser memulihkan posisi gulir. */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    window.addEventListener("load", () => window.scrollTo(0, 0));

    isiHalaman();

    // kalender digambar sebelum animasi, supaya petaknya ikut dianimasikan
    if (window.BirthdayKalender) window.BirthdayKalender.gambar();

    const kelopak = new window.BirthdayKelopak($("#kelopak"));
    kelopak.mulai();

    /* Jaring pengaman: bila GSAP tidak tersedia (atau pengguna meminta
     * "kurangi gerakan"), hapus penanda "js" supaya semua elemen yang
     * disembunyikan CSS langsung tampil. Halaman tidak pernah kosong. */
    if (!pakaiGSAP) document.documentElement.classList.remove("js");

    siapkanHero();
    siapkanScroll();
    siapkanKartu();
    siapkanConfetti();
    siapkanMusik();
    siapkanKejutan();
    siapkanToples();
    siapkanPetunjukGulir();

    document.body.classList.add("siap");
    document.body.dataset.siap = "1";
    document.body.dataset.gsap = pakaiGSAP ? "ada" : "tidak";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
