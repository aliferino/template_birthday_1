/* ═══════════════════════════════════════════════════════════════════════════
   MUSIK , memutar berkas lagu dari assets/lagu.mp3

   ── Kenapa musiknya kadang tidak langsung berbunyi? ───────────────────────
   Chrome, Safari, Firefox, dan Edge semuanya melarang suara berbunyi
   otomatis sebelum pengguna menyentuh halaman. Ini kebijakan browser,
   bukan kesalahan kode. Aturannya:

     * Suara otomatis        -> DIBLOKIR, kecuali pengguna sering
                                mengunjungi situs itu (skor MEI tinggi)
     * Bisu otomatis         -> SELALU DIIZINKAN, tanpa syarat
     * Dinyalakan setelah
       pengguna menyentuh    -> SELALU DIIZINKAN

   ── Cara mengatasinya ─────────────────────────────────────────────────────
   1. Coba putar dengan suara. Bila diizinkan, langsung berbunyi.
   2. Bila diblokir, lagunya tetap dijalankan dalam keadaan BISU. Ini pasti
      berhasil, jadi lagunya sudah berjalan sejak detik pertama.
   3. Begitu pengguna menyentuh halaman (sentuh, klik, ketuk tombol, atau
      gulir), suaranya dinyalakan. Karena ada sentuhan, browser mengizinkan.

   Hasilnya: lagunya sudah berjalan dari awal. Suaranya menyusul pada
   sentuhan pertama, dan pengguna tidak perlu menekan apa pun.

   ── Tombol di kanan atas ──────────────────────────────────────────────────
   Untuk membisukan. Lagu TIDAK berhenti, hanya tidak terdengar, sehingga
   saat dinyalakan lagi suaranya menyambung dari posisi terakhir.

   Pengaturan ada di js/config.js bagian "musik".
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  class Musik {
    constructor(opsi) {
      this.opsi = Object.assign({
        berkas: "assets/lagu.mp3",
        volume: 0.45,
        ulang: true,
        onStateChange: null,
      }, opsi || {});

      this.audio = null;
      this.aktif = false;          // true = lagu sedang berjalan
      this.bisu = false;           // true = sedang tidak terdengar
      this.gagal = false;          // true = berkas lagunya tidak bisa dimuat
      this.sudahMulai = false;     // true = lagu sudah pernah dijalankan
      this.menungguSentuhan = false; // true = berjalan bisu, menunggu sentuhan
      this.dibisukanPengguna = false; // true = pengguna sendiri yang membisukan
    }

    /* Kembalikan lagu ke detik 0.
     * Dipakai saat halaman baru dibuka (termasuk setelah refresh), supaya
     * lagunya selalu mulai dari awal. Browser kadang memulihkan posisi
     * terakhir, jadi posisinya ditegaskan ulang di sini. */
    _keAwal() {
      if (!this.audio) return;
      try {
        this.audio.currentTime = 0;
      } catch (_) { /* berkas belum siap, abaikan */ }
    }

    /* Buat elemen audio sekali saja, saat pertama dibutuhkan. */
    _siapkan() {
      if (this.audio) return true;
      if (typeof window.Audio === "undefined") return false;

      const a = document.createElement("audio");
      a.src = this.opsi.berkas;
      a.preload = "auto";
      a.loop = !!this.opsi.ulang;
      a.volume = this.opsi.volume;
      a.setAttribute("playsinline", "");     // iOS: jangan buka pemutar penuh

      /* PENTING: event "error" di sini TIDAK selalu berarti berkas lagunya
         gagal dimuat. Browser juga memicunya untuk masalah PERANGKAT SUARA,
         misalnya "OnMediaSinkAudioError" ketika komputer tidak punya speaker
         atau headphone. Kalau itu yang terjadi, berkasnya sebenarnya sudah
         termuat penuh dan lagunya tetap berjalan, hanya tidak terdengar.

         Karena itu diperiksa dulu sebelum ditandai gagal. Tanpa pemeriksaan
         ini, tombolnya akan menulis "gagal dimuat" padahal lagunya normal,
         dan itu menyesatkan. */
      a.addEventListener("error", () => {
        const pesan = a.error ? String(a.error.message || "") : "";

        /* Masalah perangkat suara, bukan masalah berkas. */
        const soalPerangkat = /sink|device|output|audioerror/i.test(pesan);

        /* Berkasnya sudah cukup termuat untuk diputar. */
        const berkasSiap = a.readyState >= 3;   // HAVE_FUTURE_DATA ke atas

        if (soalPerangkat || berkasSiap) return;

        this.gagal = true;
        this._lapor();
      });

      a.addEventListener("play", () => {
        this.aktif = true;
        this._lapor();
      });

      a.addEventListener("pause", () => {
        this.aktif = false;
        this._lapor();
      });

      a.addEventListener("volumechange", () => {
        this.bisu = a.muted;
        this._lapor();
      });

      /* Sebagian browser memulihkan posisi putar terakhir setelah metadata
         siap. Karena itu posisinya direset lagi selama lagunya belum mulai. */
      a.addEventListener("loadedmetadata", () => {
        if (!this.sudahMulai) this._keAwal();
      });

      /* Dimasukkan ke halaman (tapi tidak terlihat) supaya lebih andal di
         semua browser, dan supaya keadaannya bisa diperiksa. */
      a.style.display = "none";
      a.setAttribute("aria-hidden", "true");
      if (document.body) document.body.appendChild(a);

      this.audio = a;
      return true;
    }

    /* Jalankan lagunya, dengan suara bila diizinkan.
     *
     * Mengembalikan Promise berisi keterangan:
     *   { jalan: true,  bersuara: true }   -> berbunyi normal
     *   { jalan: true,  bersuara: false }  -> berjalan bisu, tunggu sentuhan
     *   { jalan: false }                   -> gagal total
     */
    mulai() {
      if (this.gagal) return Promise.resolve({ jalan: false, bersuara: false });
      if (!this._siapkan()) return Promise.resolve({ jalan: false, bersuara: false });

      /* Putaran pertama setelah halaman dibuka selalu mulai dari detik 0. */
      if (!this.sudahMulai) {
        this._keAwal();
        this.sudahMulai = true;
      }

      const a = this.audio;
      a.muted = false;

      /* Coba dengan suara lebih dulu. */
      return this._putar()
        .then((bersuara) => {
          if (bersuara) {
            this._selesai(true);
            return { jalan: true, bersuara: true };
          }

          /* Diblokir. Jalankan dalam keadaan BISU, karena itu selalu
             diizinkan. Lagunya sudah berjalan dari awal, suaranya menyusul
             pada sentuhan pertama. */
          a.muted = true;
          return this._putar().then((jalan) => {
            this._selesai(jalan);
            if (jalan) {
              this.menungguSentuhan = true;
              this.pasangPembukaBisu();
              this._lapor();
            }
            return { jalan: jalan, bersuara: false };
          });
        });
    }

    /* Putar sekali, kembalikan Promise<boolean> apakah berhasil.
     * Gagal itu WAJAR (browser memblokir), bukan kesalahan kode. */
    _putar() {
      const a = this.audio;
      let janji;

      try {
        janji = a.play();
      } catch (_) {
        return Promise.resolve(false);
      }

      /* Browser lama: play() tidak mengembalikan Promise. */
      if (!janji || typeof janji.then !== "function") {
        return Promise.resolve(!a.paused);
      }

      return janji
        .then(() => true)
        .catch(() => false);
    }

    _selesai(jalan) {
      this.aktif = !!jalan;
      this.bisu = this.audio ? this.audio.muted : false;
      this._lapor();
    }

    /* Pasang pembuka bisu: pada sentuhan/klik pertama, suaranya dinyalakan.
     *
     * PENTING: browser hanya menganggap klik, ketukan (touchend), dan tombol
     * keyboard sebagai "aksi pengguna" yang boleh menyalakan suara. Event
     * "scroll", "wheel", dan "touchstart" TIDAK dihitung. Karena itu pembuka
     * ini tidak mau lepas sebelum suaranya benar-benar berbunyi. Kalau
     * percobaan gagal (event belum dihitung browser), lagunya dibisukan
     * lagi dan pembuka menunggu event berikutnya. */
    pasangPembukaBisu() {
      if (this._pembukaTerpasang) return;
      this._pembukaTerpasang = true;

      const kejadian = ["pointerdown", "mousedown", "pointerup", "touchend", "click", "keydown"];

      const lepas = () => {
        kejadian.forEach((k) => window.removeEventListener(k, buka, true));
        this._pembukaTerpasang = false;
      };

      const buka = () => {
        /* Pengguna membisukan sendiri: jangan diganggu. */
        if (this.dibisukanPengguna) { lepas(); return; }

        const a = this.audio;
        a.muted = false;

        const janji = a.paused ? this._putar() : Promise.resolve(true);
        janji.then((ok) => {
          if (ok && !a.paused && !a.muted) {
            this.menungguSentuhan = false;
            this.bisu = false;
            this._lapor();
            lepas();
          } else {
            /* Belum diizinkan browser. Tetap bisu, tunggu event berikutnya. */
            a.muted = true;
            if (a.paused) this._putar();
          }
        });
      };

      kejadian.forEach((k) => window.addEventListener(k, buka, true));

      /* Cadangan: hanya bila browser mencatat pengguna sudah pernah
         berinteraksi dengan halaman ini. */
      window.setTimeout(() => {
        const sudahAktif = navigator.userActivation && navigator.userActivation.hasBeenActive;
        if (sudahAktif && this.menungguSentuhan && !this.dibisukanPengguna) buka();
      }, 1500);
    }

    jeda() {
      if (!this.audio) return;
      this.audio.pause();
      this.aktif = false;
      this._lapor();
    }

    /* Bisukan atau nyalakan kembali, tanpa menghentikan lagunya. */
    setBisu(nilai) {
      if (!this.audio) return;
      this.audio.muted = !!nilai;
      this.bisu = this.audio.muted;
      this.dibisukanPengguna = this.audio.muted;
      if (!this.audio.muted) this.menungguSentuhan = false;
      this._lapor();
    }

    /* Satu tombol untuk dua keadaan:
     *   - lagu belum berjalan -> jalankan
     *   - lagu sudah berjalan -> bisukan / nyalakan
     * Dengan begitu tombolnya tetap berguna walau putar otomatis diblokir. */
    toggle() {
      if (this.gagal) return false;

      if (!this.aktif) {
        this.mulai();
        return true;
      }

      this.setBisu(!this.bisu);
      return !this.bisu;
    }

    /* Keadaan untuk ditampilkan pada tombol. */
    keadaan() {
      return {
        aktif: this.aktif,
        bisu: this.bisu,
        gagal: this.gagal,
        /* Berjalan tapi belum terdengar karena menunggu sentuhan pertama. */
        menungguSentuhan: this.menungguSentuhan,
      };
    }

    _lapor() {
      if (typeof this.opsi.onStateChange === "function") {
        this.opsi.onStateChange(this.keadaan());
      }
    }
  }

  window.BirthdayMusik = Musik;
})();
