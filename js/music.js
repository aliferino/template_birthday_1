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

      a.addEventListener("error", () => {
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

    /* Pasang pembuka bisu: pada sentuhan pertama, suaranya dinyalakan.
     *
     * Dilepas sendiri setelah berhasil, jadi tidak ada pendengar menganggur.
     * Bila pengguna sendiri yang membisukan, pembuka ini tidak dipasang,
     * supaya musiknya tidak menyala lagi tanpa dikehendaki. */
    pasangPembukaBisu() {
      if (this._pembukaTerpasang) return;
      this._pembukaTerpasang = true;

      const kejadian = ["pointerdown", "click", "touchstart", "keydown", "wheel", "scroll"];

      const buka = () => {
        /* Pengguna membisukan sendiri: jangan diganggu. */
        if (this.dibisukanPengguna) { lepas(); return; }

        this.audio.muted = false;
        this.menungguSentuhan = false;
        this.bisu = false;
        this._lapor();
        lepas();

        /* Bila ternyata belum berjalan (misal dijeda browser), coba lagi. */
        if (this.audio.paused) this._putar();
      };

      const lepas = () => {
        kejadian.forEach((k) => window.removeEventListener(k, buka));
        this._pembukaTerpasang = false;
      };

      kejadian.forEach((k) =>
        window.addEventListener(k, buka, { passive: true }));

      /* Cadangan: kalau halaman sudah selesai dimuat dan pengguna kebetulan
         sudah pernah berinteraksi dengan situs ini, coba nyalakan langsung. */
      window.setTimeout(() => {
        if (this.menungguSentuhan && !this.dibisukanPengguna) buka();
      }, 3000);
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
