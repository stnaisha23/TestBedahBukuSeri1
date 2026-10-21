const C = window.CONFIG;
const $ = (s, r = document) => r.querySelector(s);

/* ---------- Tampilan dasar ---------- */
function bindConfig() {
  document.querySelectorAll("[data-cfg]").forEach(el => { el.textContent = C[el.dataset.cfg] || ""; });
  const logo = $("#logo");
  if (logo) { logo.src = C.LOGO; logo.onerror = () => logo.remove(); }
  document.title = `${document.title} — ${C.INSTANSI}`;
}
document.addEventListener("DOMContentLoaded", bindConfig);

/* ---------- Komunikasi dengan Google Apps Script ---------- */
async function apiPost(payload) {
  // Body berupa teks biasa agar tidak memicu preflight CORS
  const r = await fetch(C.API_URL, { method: "POST", body: JSON.stringify(payload) });
  return r.json();
}
async function apiGet(params) {
  const r = await fetch(C.API_URL + "?" + new URLSearchParams(params));
  return r.json();
}

/* ---------- Waktu ---------- */
const waktuMulai = () => new Date(C.MULAI).getTime();
const sudahMulai = () => Date.now() >= waktuMulai();

/* ---------- Dialog ---------- */
function showDialog({ judul, isi, aksi = [] }) {
  const dlg = $("#dlg");
  $("#dlgJudul").textContent = judul;
  const body = $("#dlgIsi");
  body.innerHTML = "";
  if (typeof isi === "string") { const p = document.createElement("p"); p.textContent = isi; body.append(p); }
  else if (isi) body.append(isi);
  const act = $("#dlgAksi");
  act.innerHTML = "";
  aksi.forEach(a => {
    const el = document.createElement(a.href ? "a" : "button");
    el.className = "btn" + (a.sekunder ? " btn-sec" : "");
    el.textContent = a.teks;
    if (a.href) el.href = a.href; else el.type = "button";
    el.addEventListener("click", () => { if (a.onClick) a.onClick(); if (!a.href && !a.tetap) dlg.close(); });
    act.append(el);
  });
  if (!dlg.open) dlg.showModal();
}

/* ---------- Sertifikat ---------- */
function titleCase(s) {
  return s.toLowerCase().replace(/(^|[\s.-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Template tidak ditemukan: " + src));
    img.src = src;
  });
}
async function buildCertificate(nama) {
  const k = C.CERT;
  await document.fonts.load(`${k.fontStyle} 40px "${k.fontFamily}"`);
  const img = await loadImage(k.template);
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const teks = k.format === "upper" ? nama.toUpperCase() : k.format === "title" ? titleCase(nama) : nama;
  let size = cv.width * k.fontSize;
  const maxW = cv.width * k.maxWidth;
  const set = () => (ctx.font = `${k.fontStyle} ${size}px "${k.fontFamily}"`);
  set();
  while (ctx.measureText(teks).width > maxW && size > 20) { size -= 2; set(); }

  ctx.fillStyle = k.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(teks, cv.width * k.x, cv.height * k.y);
  return cv;
}
function unduhPNG(cv, nama) {
  cv.toBlob(b => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `Sertifikat - ${nama}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, "image/png");
}
function unduhPDF(cv, nama) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: cv.width >= cv.height ? "l" : "p", unit: "px", format: [cv.width, cv.height] });
  pdf.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, cv.width, cv.height);
  pdf.save(`Sertifikat - ${nama}.pdf`);
}
async function tampilkanSertifikat(box, nama) {
  box.innerHTML = '<p class="muted">Memproses sertifikat…</p>';
  try {
    const cv = await buildCertificate(nama);
    cv.className = "cert";
    box.innerHTML = "";
    box.append(cv);
    const row = document.createElement("div");
    row.className = "aksi";
    const b1 = document.createElement("button");
    b1.className = "btn"; b1.type = "button"; b1.textContent = "Unduh PNG";
    b1.onclick = () => unduhPNG(cv, nama);
    const b2 = document.createElement("button");
    b2.className = "btn btn-sec"; b2.type = "button"; b2.textContent = "Unduh PDF";
    b2.onclick = () => unduhPDF(cv, nama);
    row.append(b1, b2);
    box.append(row);
  } catch (e) {
    box.innerHTML = '<p class="galat">Sertifikat gagal dibuat. Periksa nama file template di config.js.</p>';
    console.error(e);
  }
}
