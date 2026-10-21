// ============================================================
// KONFIGURASI UTAMA — cukup ubah file ini untuk kegiatan baru
// ============================================================
window.CONFIG = {
  // URL Web App Google Apps Script (diperoleh setelah Deploy, lihat PANDUAN.md)
  API_URL: "https://script.google.com/macros/s/AKfycbxKS_HkPWX4x1s39zmS0OUk9yTnDykIuvgxV042xvPPXDfW6lvez1f8Z8HvtPsMHWi1/exec",

  INSTANSI: "KIP KABUPATEN ACEH SINGKIL",
  KEGIATAN: "BEDAH BUKU 2026",
  SERI: "Seri 1",
  TANGGAL_TEKS: "Rabu, 23 September 2026 · 09.00 WIB",
  FOOTER: "KIP Kabupaten Aceh Singkil · Aceh Singkil",
  LOGO: "assets/logo.png", // opsional; jika file tidak ada, logo disembunyikan otomatis

  // Waktu (format ISO, sertakan zona waktu: +07:00 WIB, +08:00 WITA, +09:00 WIT)
  MULAI: "2026-10-21T09:00:00+07:00",   // form daftar hadir terbuka mulai waktu ini
  SELESAI: "2026-10-21T12:00:00+07:00", // hanya untuk teks "kegiatan selesai" di beranda

  // Menu beranda. "href" boleh tautan relatif (halaman sendiri) atau tautan luar.
  MENU: [
    { judul: "Daftar Hadir", ket: "Isi presensi, sertifikat langsung terbit", href: "absen.html" },
    { judul: "Link Zoom", ket: "Masuk ke ruang pertemuan", href: "https://zoom.us/j/GANTI", luar: true },
    { judul: "Background Zoom", ket: "Unduh latar belakang resmi", href: "https://drive.google.com/GANTI", luar: true },
    { judul: "Materi", ket: "Folder materi kegiatan", href: "https://drive.google.com/drive/u/0/folders/17XU9rwqbfGebqdYqe8BMEjwh8WDQr36s", luar: true },
    { judul: "Sertifikat", ket: "Unduh ulang dengan email Anda", href: "sertifikat.html" }
  ],

  // Pengaturan penempatan nama pada template sertifikat.
  // x, y = posisi tengah nama sebagai pecahan lebar/tinggi gambar (0–1).
  CERT: {
    template: "assets/template-sertifikat.png",
    x: 0.5,
    y: 0.47,
    maxWidth: 0.70,   // lebar maksimum nama (pecahan lebar gambar); font mengecil otomatis
    fontSize: 0.05,   // ukuran font awal (pecahan lebar gambar)
    fontFamily: "Playfair Display",
    fontStyle: "italic 600",
    color: "#0E2A47",
    format: "title"   // "title" = Huruf Awal Besar, "upper" = KAPITAL, "asis" = apa adanya
  }
};
