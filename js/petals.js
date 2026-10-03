/* ═══════════════════════════════════════════════════════════════════════════
   KELOPAK BUNGA , kelopak lily yang berjatuhan di belakang konten.

   Digambar dengan Canvas 2D (bukan DOM) karena jumlahnya banyak dan terus
   bergerak; canvas jauh lebih hemat dibanding memindahkan ratusan elemen.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const WARNA = [
    ["#f8c8d8", "#f0a8c4"],   // pink muda
    ["#f5b8cc", "#e890b0"],   // pink sedang
    ["#fbd8e4", "#f5bcd0"],   // pink pucat
    ["#fff0f5", "#f8d0e0"],   // hampir putih
    ["#e8a8c0", "#d88aa8"],   // pink tua
  ];

  class Kelopak {
    constructor(w, h, acak) {
      this.reset(w, h, acak, true);
    }

    reset(w, h, acak, awal) {
      this.w = w;
      this.h = h;
      this.x = acak() * w;
      // saat pertama kali, sebar di seluruh tinggi; sesudahnya mulai dari atas
      this.y = awal ? acak() * h : -30 - acak() * 60;
      this.size = 7 + acak() * 9;
      this.kecepatan = 0.35 + acak() * 0.75;
      this.ayun = acak() * Math.PI * 2;
      this.ayunCepat = 0.008 + acak() * 0.018;
      this.putar = (acak() - 0.5) * 0.02;
      this.sudut = acak() * Math.PI * 2;
      this.warna = WARNA[Math.floor(acak() * WARNA.length)];
      this.opasitas = 0.35 + acak() * 0.5;
      this.skala = 0.7 + acak() * 0.5;
    }

    update(dt, acak) {
      this.ayun += this.ayunCepat;
      this.y += this.kecepatan * dt * 60;
      this.x += Math.sin(this.ayun) * 0.7;
      this.sudut += this.putar * dt * 60;

      if (this.y > this.h + 40) {
        this.reset(this.w, this.h, acak, false);
      }
    }

    /* Kelopak lily: satu bentuk melengkung dengan urat di tengah. */
    gambar(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.sudut);
      ctx.scale(this.skala, this.skala);
      ctx.globalAlpha = this.opasitas;

      const s = this.size;

      // gradasi dari pangkal ke ujung kelopak
      const grad = ctx.createLinearGradient(0, -s, 0, s);
      grad.addColorStop(0, this.warna[1]);
      grad.addColorStop(1, this.warna[0]);

      ctx.beginPath();
      ctx.moveTo(0, -s);
      // sisi kanan
      ctx.bezierCurveTo(s * 0.75, -s * 0.35, s * 0.6, s * 0.5, 0, s);
      // sisi kiri
      ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.75, -s * 0.35, 0, -s);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // urat tengah
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.lineTo(0, s * 0.8);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }

  class HujanKelopak {
    constructor(canvas) {
      this.cv = canvas;
      this.ctx = canvas.getContext("2d");
      this.acak = Math.random;
      this.kelopak = [];
      this.jalan = false;
      this.terakhir = 0;
      this.jumlah = 34;

      // kurangi jumlah di layar kecil supaya tetap ringan
      this._hitungJumlah();

      this._isi();
      window.addEventListener("resize", () => this._ukur());
      this._ukur();
    }

    _hitungJumlah() {
      const w = window.innerWidth;
      if (w < 600) this.jumlah = 16;
      else if (w < 1000) this.jumlah = 24;
      else this.jumlah = 34;

      // hormati preferensi "kurangi gerakan"
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.jumlah = 8;
      }
    }

    _ukur() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.cv.width = Math.round(window.innerWidth * dpr);
      this.cv.height = Math.round(window.innerHeight * dpr);
      this.cv.style.width = window.innerWidth + "px";
      this.cv.style.height = window.innerHeight + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = window.innerWidth;
      this.h = window.innerHeight;

      this._hitungJumlah();
      this._isi();
    }

    _isi() {
      this.kelopak = [];
      for (let i = 0; i < this.jumlah; i++) {
        this.kelopak.push(new Kelopak(this.w, this.h, this.acak));
      }
    }

    mulai() {
      if (this.jalan) return;
      this.jalan = true;
      this.terakhir = performance.now();
      requestAnimationFrame((t) => this._loop(t));
    }

    _loop(now) {
      if (!this.jalan) return;

      // batasi dt supaya animasi tidak melompat saat tab kembali aktif
      const dt = Math.min(0.05, (now - this.terakhir) / 1000);
      this.terakhir = now;

      this.ctx.clearRect(0, 0, this.w, this.h);
      for (const k of this.kelopak) {
        k.update(dt, this.acak);
        k.gambar(this.ctx);
      }

      requestAnimationFrame((t) => this._loop(t));
    }

    hentikan() {
      this.jalan = false;
    }
  }

  window.BirthdayKelopak = HujanKelopak;
})();
