/* ═══════════════════════════════════════════════════════════════════════════
   LAYAR PEMBUKA , kado yang harus diklik

   ── Kenapa ini menyelesaikan masalah autoplay? ──────────────────────────────

   Semua browser melarang suara berbunyi otomatis sebelum pengguna menyentuh
   halaman. Tidak ada cara menembusnya. Yang bisa dilakukan adalah menaruh
   pemutaran musik TEPAT DI DALAM penangan klik, karena klik itu sendiri
   adalah sentuhan yang sah.

   Jadi alurnya:
     1. Halaman dibuka, yang tampil layar kado dulu (belum ada suara).
     2. Pengguna mengetuk kado.
     3. Di dalam penangan klik itu: musik diputar, lalu halaman di-render.
     4. Karena putarannya terjadi di dalam sentuhan, browser mengizinkannya.

   Hasilnya musik berbunyi sejak detik pertama halaman muncul, di Chrome
   maupun peramban bawaan HP.

   ── Catatan penting ─────────────────────────────────────────────────────────

   Berkas ini SENGAJA dibuat berdiri sendiri dan dimuat PALING AKHIR, setelah
   semua skrip lain. Tujuannya supaya urutan pemuatannya begini:

     main.js selesai -> halaman siap -> pembuka.js dipasang -> menunggu klik

   Dengan begitu, saat kado diklik, halamannya sudah benar-benar siap. Kalau
   pembuka.js dimuat lebih dulu, ada kemungkinan kliknya terjadi sebelum
   halaman siap dan animasinya jadi tidak rapi.

   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var pembuka = document.getElementById("pembuka");
  var kado = document.getElementById("kado");
  if (!pembuka || !kado) return;

  /* Tautan cadangan ?buka=1 dipakai bila JavaScript mati. */
  var paksaBuka = /(\?|&)buka=1(&|$)/.test(location.search);

  var selesai = false;

  /* ── Buka halaman ──────────────────────────────────────────────────────── */
  function buka(putarMusik) {
    if (selesai) return;
    selesai = true;

    /* PENTING: dipanggil SINKRON di dalam penangan klik, sebelum apa pun
       yang asinkron. Kalau ditunda (misalnya di dalam setTimeout atau
       menunggu Promise), browser menganggapnya bukan bagian dari sentuhan
       dan suaranya tetap diblokir. */
    if (putarMusik) nyalakanMusik();

    /* Hilangkan layar kado */
    pembuka.classList.add("pergi");
    document.body.classList.remove("terkunci");

    /* Beri tahu main.js bahwa halamannya baru saja dibuka, supaya animasi
       pembukanya dijalankan dari awal. */
    window.dispatchEvent(new CustomEvent("halaman-dibuka"));

    /* Setelah animasi hilang, buang elemennya dari aliran halaman supaya
       tidak ada lapisan sisa yang menahan klik. */
    window.setTimeout(function () {
      pembuka.setAttribute("hidden", "");
      pembuka.style.display = "none";
    }, 900);
  }

  /* ── Nyalakan musik ──────────────────────────────────────────────────────
     Semua dijalankan di dalam sentuhan yang sama, jadi diizinkan browser.
     Lagunya direset ke detik 0 supaya mulai dari awal tepat saat halaman
     muncul, bukan sudah berjalan di balik layar kado. */
  function nyalakanMusik() {
    /* PENTING: elemen audio baru dibuat saat pertama dibutuhkan. Karena saat
       layar kado dipakai pemutaran otomatis dilewati, elemennya belum ada.
       Jadi dibuat dulu di sini. Pembuatannya sinkron, dan play() tetap
       dipanggil di dalam penangan klik, sehingga diizinkan browser. */
    if (window.__musik && typeof window.__musik._siapkan === "function") {
      window.__musik._siapkan();
    }

    var a = (window.__musik && window.__musik.audio) || document.querySelector("audio");
    if (!a) return;

    /* Mulai dari awal. Berkasnya sudah dimuat lebih awal lewat <link preload>,
       jadi pengulangan ini tidak membuatnya lambat. */
    try { a.currentTime = 0; } catch (_) { /* metadata belum siap, abaikan */ }

    /* Bila saat ini metadata belum siap, "currentTime = 0" di atas gagal
       tanpa pesan. Supaya lagunya tetap mulai dari awal, posisinya direset
       sekali lagi begitu metadatanya siap.

       Hanya direset bila posisinya memang masih di luar kawasan awal.
       Pemeriksaan itu penting: kalau lagunya sudah berjalan normal dan
       kejadiannya baru datang terlambat, tanpa pemeriksaan ini lagunya akan
       melompat balik ke detik 0 di tengah jalan. */
    var resetKeAwal = function () {
      if (a.currentTime > 2) { try { a.currentTime = 0; } catch (_) {} }
    };
    a.addEventListener("loadedmetadata", resetKeAwal, { once: true });

    /* Tandai sudah mulai, supaya penangan "loadedmetadata" di music.js tidak
       mengembalikan posisinya ke 0 lagi saat lagunya sedang berjalan. */
    if (window.__musik) window.__musik.sudahMulai = true;

    a.muted = false;
    a.volume = (window.BIRTHDAY && window.BIRTHDAY.musik && window.BIRTHDAY.musik.volume) || 0.45;

    /* Cara 1: play() langsung. Ini yang paling penting, karena berada di
       dalam penangan klik. */
    var janji = a.play();

    var berhasil = function () {
      /* Beri tahu modul musik bahwa suaranya sudah menyala, supaya tombol di
         kanan atas menampilkan keadaan yang benar. */
      if (window.__musik && typeof window.__musik.setBisu === "function") {
        window.__musik.setBisu(false);
      }
      if (window.__musik) {
        window.__musik.aktif = true;
        window.__musik.bisu = false;
        window.__musik.menungguSentuhan = false;
        if (typeof window.__musik._lapor === "function") window.__musik._lapor();
      }
    };

    if (janji && typeof janji.then === "function") {
      janji.then(berhasil).catch(function () {
        /* Cara 2: sebagian peramban (terutama iOS) butuh pemanggilan kedua.
           Masih dalam rangkaian sentuhan yang sama. */
        window.setTimeout(function () {
          a.muted = false;
          try { a.currentTime = 0; } catch (_) {}
          var p2 = a.play();
          if (p2 && typeof p2.then === "function") p2.then(berhasil).catch(function () {
            /* Cara 3: terakhir, coba lagi tanpa mengubah posisi. */
            window.setTimeout(function () {
              var p3 = a.play();
              if (p3 && typeof p3.then === "function") p3.then(berhasil).catch(function () {});
            }, 120);
          });
        }, 60);
      });
    } else {
      berhasil();
    }
  }

  /* ── Tangani klik kado ───────────────────────────────────────────────────
     Dipasang di beberapa kejadian sekaligus, karena sebagian peramban HP
     tidak mengirim "click" dengan andal pada tombol berisi SVG. */
  ["click", "pointerup", "touchend"].forEach(function (nama) {
    kado.addEventListener(nama, function (ev) {
      /* Cegah klik ganda dari sentuhan + klik. */
      if (selesai) return;
      if (ev && ev.type === "touchend" && ev.cancelable) ev.preventDefault();
      buka(true);
    }, { passive: false });
  });

  /* Papan ketik: Enter atau Spasi saat kado terpilih. */
  kado.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault();
      buka(true);
    }
  });

  /* ── Keadaan awal ────────────────────────────────────────────────────────
     Layar kado SELALU ditampilkan, termasuk saat halaman dimuat ulang.

     Ini disengaja. Bila kado hanya muncul sekali (misalnya disimpan di
     sessionStorage), maka pada muat ulang berikutnya tidak ada sentuhan
     pengguna, dan musiknya pasti diblokir lagi. Dengan selalu menampilkan
     kado, setiap kali halaman dibuka selalu ada sentuhan, sehingga musiknya
     selalu bisa berbunyi. */
  if (paksaBuka) {
    pembuka.setAttribute("hidden", "");
    pembuka.style.display = "none";
    document.body.classList.remove("terkunci");
    selesai = true;
    if (window.__musik) window.__musik.mulai();
  } else {
    /* Fokuskan kado supaya bisa langsung ditekan Enter, dan supaya pembaca
       layar menyebutkan tombolnya. */
    window.setTimeout(function () { kado.focus(); }, 300);
  }
})();
