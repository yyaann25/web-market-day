// ==========================================
// 1. KONFIGURASI FIREBASE & STATE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA0daCDb1c5uCITU_-4hr3fitBlIk6hJeE",
  authDomain: "bpi-profil-kelompok.firebaseapp.com",
  databaseURL:
    "https://bpi-profil-kelompok-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bpi-profil-kelompok",
  storageBucket: "bpi-profil-kelompok.firebasestorage.app",
  messagingSenderId: "48580260052",
  appId: "1:48580260052:web:2116ab5644025da2e00b41",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let aksiTertunda = null;

// ==========================================
// 2. DATA ANGGOTA
// ==========================================
const MEMBERS = [
  { nama: "Gayan Anahata Achmad", foto: "foto gayan.jpg" },
  { nama: "M. Rayhan Arrasyid Sinardo", foto: "rahman.JPG" },
  { nama: "Ghaisan Aulia Hakim", foto: "azi.JPG" },
  { nama: "Banu Mibras Naufal", foto: "azmi.JPG" },
  { nama: "Muhammad Tsani Akbar", foto: "akbar.JPG" },
  { nama: "Muhammad Hisyam Annafi", foto: "gambar hisam.png" },
  { nama: "Muhammad Noval Dwiyanto", foto: "amri.JPG" },
  { nama: "Muhammad Azmi Alqorni", foto: "azmi.JPG" },
  { nama: "Ridza Kholdun", foto: "ali.JPG" },
  { nama: "Hazel Althaf Ahsari", foto: "foto altap.jpg" },
  { nama: "Suheyl Fatkhurrahman", foto: "kenzie.JPG" },
  { nama: "Rizki Aditya Suganda", foto: "gambar adi.jpg" },
];

// ==========================================
// 3. RENDER JADWAL (REALTIME)
// ==========================================
db.ref("jadwal_piket").on("value", (snapshot) => {
  const data = snapshot.val();
  const wadah = document.getElementById("wadahJadwal");
  if (!wadah) return;

  wadah.innerHTML = "";
  if (data) {
    Object.keys(data).forEach((key) => {
      const j = data[key];
      const jumlahHadir = j.absen
        ? Object.values(j.absen).filter((a) => a.status === "Hadir").length
        : 0;

      wadah.innerHTML += `
        <div class="bg-white p-6 rounded-[2rem] border-t-8 border-blue-500 shadow-lg" data-aos="fade-up">
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-black text-blue-600 italic uppercase text-sm">${j.tanggal}</h3>
                <div class="flex gap-2 text-xs">
                    <button onclick="pemicuEdit('${key}')" class="text-blue-400 hover:text-blue-600"><i class="fas fa-edit"></i></button>
                    <button onclick="pemicuHapus('${key}')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            
            <div class="space-y-2 text-sm font-bold text-slate-700 mb-4">
                <p><span class="text-blue-400 text-[10px] block uppercase">🎤 MC</span>${j.mc}</p>
                <p><span class="text-blue-400 text-[10px] block uppercase">📖 Kultum</span>${j.kultum}</p>
                <p><span class="text-blue-400 text-[10px] block uppercase">🍲 Konsumsi</span>${j.konsumsi}</p>
            </div>

            <div class="mb-4 p-3 bg-slate-50 rounded-2xl border-l-4 border-blue-400">
                <span class="text-[9px] font-black text-blue-400 uppercase">Catatan:</span>
                <p class="text-[11px] text-slate-500 italic line-clamp-2">${j.catatan || "Belum ada catatan pertemuan."}</p>
            </div>

            <div class="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${jumlahHadir} Hadir</span>
                    <button onclick="pemicuAbsen('${key}')" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95">Absen & Catatan</button>
                </div>
                <button onclick="eksporKeWord('${key}')" class="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">
                    <i class="fas fa-file-word mr-1"></i> Ekspor Laporan (.doc)
                </button>
            </div>
        </div>`;
    });
  }
});

// ==========================================
// 4. SISTEM KEAMANAN (PASSWORD)
// ==========================================
function verifikasiPasswordAdmin() {
  const pass = document.getElementById("adminPassInput").value;
  if (pass === "KOPI1234") {
    tutupPasswordModal();
    if (aksiTertunda.type === "TAMBAH")
      document.getElementById("formTambahJadwal").classList.remove("hidden");
    else if (aksiTertunda.type === "HAPUS")
      db.ref("jadwal_piket/" + aksiTertunda.id).remove();
    else if (aksiTertunda.type === "EDIT") bukaModalEdit(aksiTertunda.id);
    else if (aksiTertunda.type === "ABSEN")
      bukaModalAbsenChecklist(aksiTertunda.id);
  } else {
    alert("Password Salah!");
  }
}

// ==========================================
// 5. SISTEM ABSEN & CATATAN (GABUNGAN)
// ==========================================
function bukaModalAbsenChecklist(idJadwal) {
  document.getElementById("absen_jadwal_id").value = idJadwal;
  const container = document.getElementById("containerChecklistAbsen");
  const areaCatatan = document.getElementById("absen_catatan");

  db.ref(`jadwal_piket/${idJadwal}`)
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val() || {};
      const dataAbsenLama = data.absen || {};

      // Set Nilai Catatan
      areaCatatan.value = data.catatan || "";

      // Render Checklist
      container.innerHTML = MEMBERS.map((m) => {
        const namaKey = m.nama.replace(/[.#$/[\]]/g, "");
        const isChecked =
          dataAbsenLama[namaKey] && dataAbsenLama[namaKey].status === "Hadir"
            ? "checked"
            : "";

        return `
        <label class="flex items-center justify-between p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200">
            <span class="text-sm font-bold text-slate-700">${m.nama}</span>
            <input type="checkbox" value="${m.nama}" class="member-checkbox w-5 h-5 accent-blue-600" ${isChecked}>
        </label>`;
      }).join("");

      document.getElementById("absenModal").classList.remove("hidden");
    });
}

function simpanAbsensiDanCatatan() {
  const idJadwal = document.getElementById("absen_jadwal_id").value;
  const isiCatatan = document.getElementById("absen_catatan").value;
  const checkboxes = document.querySelectorAll(".member-checkbox");

  const dataAbsen = {};
  checkboxes.forEach((cb) => {
    const namaKey = cb.value.replace(/[.#$/[\]]/g, "");
    dataAbsen[namaKey] = {
      nama: cb.value,
      status: cb.checked ? "Hadir" : "Tidak Hadir",
      waktu: cb.checked ? new Date().toLocaleString("id-ID") : "-",
    };
  });

  // Simpan keduanya ke Firebase
  db.ref(`jadwal_piket/${idJadwal}`)
    .update({
      absen: dataAbsen,
      catatan: isiCatatan,
    })
    .then(() => {
      alert("Kehadiran & Catatan Berhasil Disimpan!");
      tutupModalAbsen();
    });
}

// ==========================================
// 6. EKSPOR WORD (TERMASUK CATATAN)
// ==========================================
function eksporKeWord(idJadwal) {
  db.ref("jadwal_piket/" + idJadwal)
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data.absen) return alert("Belum ada data absen!");

      const listHadir = Object.values(data.absen)
        .filter((a) => a.status === "Hadir")
        .map(
          (a, i) =>
            `<tr><td style="border:1px solid #000; padding:5px; text-align:center;">${i + 1}</td><td style="border:1px solid #000; padding:5px;">${a.nama}</td><td style="border:1px solid #000; padding:5px; text-align:center;">Hadir</td></tr>`,
        )
        .join("");

      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'></head>
        <body style="font-family: Arial;">
            <center><h2>LAPORAN PERTEMUAN BPI - KELOMPOK KOPI</h2></center>
            <p><b>Tanggal:</b> ${data.tanggal}</p>
            <p><b>MC:</b> ${data.mc} | <b>Kultum:</b> ${data.kultum}</p>
            <hr>
            <h3>Hasil Pertemuan / Catatan:</h3>
            <p style="background: #f9f9f9; padding: 10px; border: 1px solid #ddd; font-style: italic;">
                ${data.catatan || "Tidak ada catatan."}
            </p>
            <h3>Daftar Kehadiran:</h3>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#eee;">
                    <th style="border:1px solid #000; padding:5px;">No</th>
                    <th style="border:1px solid #000; padding:5px;">Nama Anggota</th>
                    <th style="border:1px solid #000; padding:5px;">Status</th>
                </tr>
                ${listHadir}
            </table>
        </body></html>`;

      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Laporan_BPI_${data.tanggal.replace(/ /g, "_")}.doc`;
      link.click();
    });
}

// ==========================================
// 7. CRUD & UTILS (LENGKAP)
// ==========================================
function simpanJadwalKeFirebase() {
  const data = {
    tanggal: document.getElementById("in_tgl").value,
    mc: document.getElementById("in_mc").value || "-",
    kultum: document.getElementById("in_kultum").value || "-",
    tilawah: document.getElementById("in_tilawah").value || "-",
    konsumsi: document.getElementById("in_konsumsi").value || "-",
    catatan: "",
  };
  if (!data.tanggal) return alert("Tanggal wajib diisi!");
  db.ref("jadwal_piket")
    .push(data)
    .then(() => {
      alert("Jadwal Ditambahkan!");
      tutupFormJadwal();
    });
}

function updateJadwalKeFirebase() {
  const id = document.getElementById("edit_id").value;
  const data = {
    tanggal: document.getElementById("ed_tgl").value,
    mc: document.getElementById("ed_mc").value,
    kultum: document.getElementById("ed_kultum").value,
    tilawah: document.getElementById("ed_tilawah").value,
    konsumsi: document.getElementById("ed_konsumsi").value,
  };
  db.ref("jadwal_piket/" + id)
    .update(data)
    .then(() => {
      alert("Update Berhasil!");
      tutupEditModal();
    });
}

// Helper Functions
function pemicuTambahJadwal() {
  aksiTertunda = { type: "TAMBAH" };
  bukaPasswordModal();
}
function pemicuHapus(id) {
  aksiTertunda = { type: "HAPUS", id: id };
  bukaPasswordModal();
}
function pemicuEdit(id) {
  aksiTertunda = { type: "EDIT", id: id };
  bukaPasswordModal();
}
function pemicuAbsen(id) {
  aksiTertunda = { type: "ABSEN", id: id };
  bukaPasswordModal();
}
function bukaPasswordModal() {
  document.getElementById("passwordModal").classList.remove("hidden");
}
function tutupPasswordModal() {
  document.getElementById("passwordModal").classList.add("hidden");
  document.getElementById("adminPassInput").value = "";
}
function tutupEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}
function tutupModalAbsen() {
  document.getElementById("absenModal").classList.add("hidden");
}
function tutupFormJadwal() {
  document.getElementById("formTambahJadwal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ duration: 800, once: true });
  const grid = document.getElementById("memberGrid");
  if (grid) {
    grid.innerHTML = MEMBERS.map(
      (m) => `
      <div class="bg-white p-4 rounded-3xl text-center shadow-sm border border-slate-100">
        <div class="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-blue-400">
          <img src="img/${m.foto}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.nama)}&background=random'" class="w-full h-full object-cover">
        </div>
        <h4 class="text-[10px] font-bold uppercase text-slate-800">${m.nama}</h4>
      </div>`,
    ).join("");
  }
});

