/**
 * BACKEND PORTAL KEGIATAN — Google Apps Script
 * Tempel seluruh isi file ini ke editor Apps Script (Extensions > Apps Script)
 * pada Google Sheets Anda, lalu Deploy sebagai Web App.
 */

// Waktu form dibuka (harus sama dengan MULAI di config.js). Untuk uji coba, isi tanggal yang sudah lewat.
const BUKA_FORM = "2026-10-21T09:00:00+07:00";
const NAMA_SHEET = "Peserta";
const KOLOM = ["Waktu", "Email", "Nama", "WhatsApp", "Instansi"];

/* ---------- Pintu masuk ---------- */
function doPost(e) {
  const kunci = LockService.getScriptLock();
  try {
    kunci.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.action === "submit") return json_(simpan_(d));
    if (d.action === "update") return json_(perbaiki_(d));
    return json_({ status: "error", message: "Aksi tidak dikenal" });
  } catch (err) {
    return json_({ status: "error", message: String(err) });
  } finally {
    try { kunci.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === "get") {
    const r = cari_(norm_(p.email));
    return json_(r ? { status: "ok", nama: r.nama } : { status: "notfound" });
  }
  return json_({ status: "ok", pesan: "API portal kegiatan aktif" });
}

/* ---------- Logika ---------- */
function simpan_(d) {
  if (new Date() < new Date(BUKA_FORM)) return { status: "locked" };

  const email = norm_(d.email);
  const nama = String(d.nama || "").trim();
  const wa = String(d.wa || "").trim();
  const instansi = String(d.instansi || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "error", message: "Email tidak valid" };
  if (nama.length < 3 || nama.length > 100) return { status: "error", message: "Nama tidak valid" };
  if (digit_(wa).length < 9) return { status: "error", message: "Nomor tidak valid" };
  if (!instansi) return { status: "error", message: "Instansi kosong" };

  if (cari_(email)) return { status: "duplicate" };

  sheet_().appendRow([new Date(), email, aman_(nama), aman_(wa), aman_(instansi)]);
  return { status: "ok", nama: nama };
}

function perbaiki_(d) {
  const email = norm_(d.email);
  const nama = String(d.nama || "").trim();
  if (nama.length < 3 || nama.length > 100) return { status: "error", message: "Nama tidak valid" };

  const r = cari_(email);
  if (!r) return { status: "notfound" };
  if (telp_(r.wa) !== telp_(d.wa)) return { status: "mismatch" };

  sheet_().getRange(r.baris, 3).setValue(aman_(nama));
  return { status: "ok" };
}

/* ---------- Pembantu ---------- */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(NAMA_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NAMA_SHEET);
    sh.appendRow(KOLOM);
    sh.setFrozenRows(1);
    sh.getRange("D:D").setNumberFormat("@"); // nomor WA disimpan sebagai teks
  }
  return sh;
}

function cari_(email) {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return null;
  const data = sh.getRange(2, 2, n, 3).getValues(); // Email, Nama, WhatsApp
  for (let i = 0; i < data.length; i++) {
    if (norm_(data[i][0]) === email) return { baris: i + 2, nama: data[i][1], wa: data[i][2] };
  }
  return null;
}

const norm_ = s => String(s || "").trim().toLowerCase();
const digit_ = s => String(s || "").replace(/\D/g, "");
const telp_ = s => digit_(s).replace(/^62/, "0"); // 62812… dan 0812… dianggap sama
// Cegah injeksi rumus Sheets (=, +, -, @ di awal teks)
const aman_ = s => (/^[=+\-@]/.test(s) ? "'" + s : s);

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Jalankan sekali secara manual untuk membuat sheet "Peserta" dan memberi izin akses. */
function setup() { sheet_(); }
