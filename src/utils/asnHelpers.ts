import { GolonganRuang, Pegawai } from '../types/asn';

// Daftar Nama Pangkat berdasarkan Golongan/Ruang
export const PANGKAT_MAP: Record<GolonganRuang, string> = {
  'I/a': 'Juru Muda',
  'I/b': 'Juru Muda Tingkat I',
  'I/c': 'Juru',
  'I/d': 'Juru Tingkat I',
  'II/a': 'Pengatur Muda',
  'II/b': 'Pengatur Muda Tingkat I',
  'II/c': 'Pengatur',
  'II/d': 'Pengatur Tingkat I',
  'III/a': 'Penata Muda',
  'III/b': 'Penata Muda Tingkat I',
  'III/c': 'Penata',
  'III/d': 'Penata Tingkat I',
  'IV/a': 'Pembina',
  'IV/b': 'Pembina Tingkat I',
  'IV/c': 'Pembina Utama Muda',
  'IV/d': 'Pembina Utama Madya',
  'IV/e': 'Pembina Utama',
  'PPPK-VII': 'PPPK Golongan VII',
  'PPPK-IX': 'PPPK Golongan IX (Ahli Pertama)',
  'PPPK-X': 'PPPK Golongan X (Ahli Muda)',
};

export const UNIT_KERJA_LIST = [
  'Badan Kepegawaian dan Pengembangan SDM',
  'Badan Perencanaan Pembangunan Daerah',
  'Badan Pengelolaan Keuangan dan Aset Daerah',
  'Inspektorat Daerah',
  'Dinas Pendidikan dan Kebudayaan',
  'Dinas Kesehatan',
  'Dinas Komunikasi, Informatika dan Statistik',
  'Dinas Pekerjaan Umum dan Penataan Ruang',
  'Dinas Kependudukan dan Pencatatan Sipil',
  'Sekretariat Daerah',
];

export const FORMASI_ABK_MAP: Record<string, number> = {
  'Badan Kepegawaian dan Pengembangan SDM': 28,
  'Badan Perencanaan Pembangunan Daerah': 32,
  'Badan Pengelolaan Keuangan dan Aset Daerah': 35,
  'Inspektorat Daerah': 24,
  'Dinas Pendidikan dan Kebudayaan': 45,
  'Dinas Kesehatan': 40,
  'Dinas Komunikasi, Informatika dan Statistik': 26,
  'Dinas Pekerjaan Umum dan Penataan Ruang': 38,
  'Dinas Kependudukan dan Pencatatan Sipil': 30,
  'Sekretariat Daerah': 42,
};

// Hitung Umur saat ini dari tanggal lahir
export function hitungUmur(tanggalLahir: string): number {
  if (!tanggalLahir) return 0;
  const birth = new Date(tanggalLahir);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Rekomendasi Kelas Jabatan standard berdasarkan eselon/jenis jabatan/golongan
export function estimasiKelasJabatan(
  kategori: 'Struktural' | 'Fungsional' | 'Pelaksana',
  eselon?: string,
  golongan?: string
): number {
  if (kategori === 'Struktural') {
    if (eselon === 'II.a') return 15;
    if (eselon === 'II.b') return 14;
    if (eselon === 'III.a') return 12;
    if (eselon === 'III.b') return 11;
    if (eselon === 'IV.a') return 9;
    if (eselon === 'IV.b') return 8;
    return 10;
  }
  if (kategori === 'Fungsional') {
    if (golongan?.startsWith('IV')) return 12; // JF Madya / Utama
    if (golongan === 'III/d' || golongan === 'III/c') return 9; // JF Muda
    if (golongan === 'III/b' || golongan === 'III/a') return 8; // JF Pertama
    if (golongan?.startsWith('II')) return 7; // JF Mahir / Terampil
    return 8;
  }
  // Pelaksana
  if (golongan?.startsWith('III')) return 7;
  if (golongan?.startsWith('II')) return 5;
  if (golongan?.startsWith('I/')) return 3;
  return 5;
}

// Definisi Kamus Panduan Kolom Form Excel
export interface TemplateColumnDef {
  key: string;
  header: string;
  contoh: string;
  wajib: boolean;
  keterangan: string;
  pilihan?: string[];
}

export const EXCEL_IMPORT_COLUMNS: TemplateColumnDef[] = [
  {
    key: 'nip',
    header: 'NIP (18 Digit)',
    contoh: '198504122010011004',
    wajib: true,
    keterangan: 'Nomor Induk Pegawai 18 angka standard BKN. Tanggal lahir, jenis kelamin, dan TMT CPNS dihitung otomatis.',
  },
  {
    key: 'nama',
    header: 'Nama Lengkap (Beserta Gelar)',
    contoh: 'Dr. Ahmad Fauzi, S.T., M.Eng.',
    wajib: true,
    keterangan: 'Nama lengkap aparatur, boleh langsung menyertakan gelar depan dan belakang.',
  },
  {
    key: 'jenisPegawai',
    header: 'Jenis Pegawai (PNS / PPPK)',
    contoh: 'PNS',
    wajib: true,
    keterangan: 'Pilih salah satu: PNS atau PPPK.',
    pilihan: ['PNS', 'PPPK'],
  },
  {
    key: 'golongan',
    header: 'Golongan Ruang',
    contoh: 'III/d',
    wajib: true,
    keterangan: 'Golongan ruang (PNS: I/a s.d IV/e | PPPK: PPPK-VII, PPPK-IX, PPPK-X).',
    pilihan: [
      'I/a', 'I/b', 'I/c', 'I/d',
      'II/a', 'II/b', 'II/c', 'II/d',
      'III/a', 'III/b', 'III/c', 'III/d',
      'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e',
      'PPPK-VII', 'PPPK-IX', 'PPPK-X'
    ],
  },
  {
    key: 'jabatan',
    header: 'Nama Jabatan',
    contoh: 'Pranata Komputer Ahli Muda',
    wajib: true,
    keterangan: 'Nama jabatan resmi sesuai SK penugasan (contoh: Kepala Dinas, Auditor Ahli Pertama, Staf Keuangan).',
  },
  {
    key: 'kelasJabatan',
    header: 'Kelas Jabatan (1 - 17)',
    contoh: '9',
    wajib: true,
    keterangan: 'Angka 1 sampai 17 (Kadis=14, Kabid=11-12, Kasubag/JF Muda=9, JF Pertama=8, Pelaksana=5-7).',
  },
  {
    key: 'kategoriJabatan',
    header: 'Jenis Jabatan (Struktural / Fungsional / Pelaksana)',
    contoh: 'Fungsional',
    wajib: true,
    keterangan: 'Pilih salah satu dari 3 kelompok: Struktural, Fungsional, atau Pelaksana.',
    pilihan: ['Struktural', 'Fungsional', 'Pelaksana'],
  },
  {
    key: 'unitKerja',
    header: 'Satuan Kerja / Unit Kerja (OPD)',
    contoh: 'Dinas Komunikasi, Informatika dan Statistik',
    wajib: true,
    keterangan: 'Nama Dinas, Badan, Sekretariat, atau Inspektorat tempat pegawai bertugas.',
  },
  {
    key: 'statusKepegawaian',
    header: 'Status Kepegawaian (Aktif / Pensiun / Mutasi)',
    contoh: 'Aktif',
    wajib: true,
    keterangan: 'Pilih salah satu status: Aktif, Pensiun, atau Mutasi.',
    pilihan: ['Aktif', 'Pensiun', 'Mutasi'],
  },
  {
    key: 'jenjangPendidikan',
    header: 'Jenjang Pendidikan Terakhir',
    contoh: 'Sarjana (S-1) / D-4',
    wajib: false,
    keterangan: 'Pendidikan terakhir: SLTA / Sederajat, Diploma III (D-3), Sarjana (S-1) / D-4, Magister (S-2), Doktor (S-3).',
    pilihan: ['SLTA / Sederajat', 'Diploma III (D-3)', 'Sarjana (S-1) / D-4', 'Magister (S-2)', 'Doktor (S-3)'],
  },
  {
    key: 'usia',
    header: 'Usia (Tahun)',
    contoh: '39',
    wajib: false,
    keterangan: 'Usia saat ini dalam tahun (bila NIP diisi dengan benar, usia akan dihitung otomatis).',
  },
  {
    key: 'noHp',
    header: 'Nomor WhatsApp / HP',
    contoh: '081234567890',
    wajib: false,
    keterangan: 'Nomor handphone/kontak aktif untuk koordinasi kedinasan.',
  },
];

// Data contoh baris form Excel yang mencakup seluruh skenario (PNS Struktural, PNS Fungsional, PPPK, Pelaksana, Pensiun, Mutasi)
export const SAMPLE_EXCEL_ROWS: (string | number)[][] = [
  [
    '198504122010011004',
    'Dr. Ahmad Fauzi, S.T., M.Eng.',
    'PNS',
    'III/d',
    'Pranata Komputer Ahli Muda',
    9,
    'Fungsional',
    'Dinas Komunikasi, Informatika dan Statistik',
    'Aktif',
    'Magister (S-2)',
    39,
    '081234567890',
  ],
  [
    '197805141999031002',
    'H. Dedy Supriyadi, S.IP., M.Si.',
    'PNS',
    'IV/b',
    'Kepala Bagian Organisasi',
    12,
    'Struktural',
    'Sekretariat Daerah',
    'Aktif',
    'Magister (S-2)',
    46,
    '081299887766',
  ],
  [
    '199208202023212005',
    'Siti Nurhaliza, S.Pd.',
    'PPPK',
    'PPPK-IX',
    'Guru Ahli Pertama',
    8,
    'Fungsional',
    'Dinas Pendidikan dan Kebudayaan',
    'Aktif',
    'Sarjana (S-1) / D-4',
    32,
    '081398765432',
  ],
  [
    '199507152019032008',
    'Budi Prasetyo, A.Md.',
    'PNS',
    'II/c',
    'Pengadministrasi Keuangan',
    5,
    'Pelaksana',
    'Badan Pengelolaan Keuangan dan Aset Daerah',
    'Aktif',
    'Diploma III (D-3)',
    29,
    '085612345678',
  ],
  [
    '196812101994031003',
    'Ir. Hendra Gunawan, M.T.',
    'PNS',
    'IV/c',
    'Kepala Dinas',
    14,
    'Struktural',
    'Dinas Pekerjaan Umum dan Penataan Ruang',
    'Pensiun',
    'Magister (S-2)',
    60,
    '081122334455',
  ],
  [
    '197908222005012004',
    'Dra. Hj. Sri Wahyuni, M.M.',
    'PNS',
    'IV/b',
    'Sekretaris Badan',
    12,
    'Struktural',
    'Badan Kepegawaian dan Pengembangan SDM',
    'Mutasi',
    'Magister (S-2)',
    45,
    '081398765432',
  ],
];

// Unduh Template Format CSV UTF-8 (Kompatibel Semua Excel & Sheets)
export function downloadImportTemplate() {
  const headers = EXCEL_IMPORT_COLUMNS.map(c => c.header);
  exportToCSV('Format_Excel_Import_Pegawai_ASN', headers, SAMPLE_EXCEL_ROWS);
}

// Unduh File Excel Resmi Berformat Indah (.xls dengan Header Berwarna & Petunjuk Tersemat)
export function downloadFormattedExcelTemplate() {
  const headers = EXCEL_IMPORT_COLUMNS.map(c => c.header);

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <title>Formulir Import Data Pegawai ASN</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
        .title-block { font-size: 16pt; font-weight: bold; color: #0f172a; padding: 10px 0; }
        .subtitle { font-size: 10pt; color: #475569; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; margin-top: 8px; }
        th { 
          background-color: #1e293b; 
          color: #ffffff; 
          font-weight: bold; 
          border: 1px solid #0f172a; 
          padding: 10px 12px; 
          text-align: left; 
          font-size: 10.5pt;
        }
        th.center { text-align: center; }
        td { 
          border: 1px solid #cbd5e1; 
          padding: 8px 10px; 
          vertical-align: middle; 
          font-size: 10pt;
        }
        tr:nth-child(even) { background-color: #f8fafc; }
        .center { text-align: center; }
        .badge-aktif { background-color: #ecfdf5; color: #065f46; font-weight: bold; }
        .badge-pensiun { background-color: #f1f5f9; color: #475569; font-weight: bold; }
        .badge-mutasi { background-color: #fffbeb; color: #92400e; font-weight: bold; }
        .guide-box { margin-top: 25px; border-top: 2px dashed #94a3b8; padding-top: 15px; }
        .guide-title { font-weight: bold; font-size: 12pt; color: #0f172a; }
        .guide-item { margin-top: 6px; font-size: 9.5pt; color: #334155; }
      </style>
    </head>
    <body>
      <div class="title-block">FORMULIR MASTER DATA PEGAWAI ASN</div>
      <div class="subtitle">Format Resmi Import SIMPEG Analitika ASN &middot; Disusun Sesuai Standar BKN &amp; KemenPAN-RB</div>
      
      <table>
        <thead>
          <tr>
            <th class="center" style="width: 40px;">No</th>
            ${headers.map(h => `<th ${h.includes('Kelas') || h.includes('Usia') || h.includes('Status') ? 'class="center"' : ''}>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${SAMPLE_EXCEL_ROWS.map((row, idx) => `
            <tr>
              <td class="center" style="font-weight: bold; color: #64748b;">${idx + 1}</td>
              <td style="mso-number-format:'\\@'; font-family: monospace;">${row[0]}</td>
              <td style="font-weight: 600;">${row[1]}</td>
              <td class="center">${row[2]}</td>
              <td class="center" style="font-weight: bold;">${row[3]}</td>
              <td>${row[4]}</td>
              <td class="center" style="font-weight: bold; color: #b45309;">${row[5]}</td>
              <td class="center">${row[6]}</td>
              <td>${row[7]}</td>
              <td class="center ${row[8] === 'Aktif' ? 'badge-aktif' : row[8] === 'Pensiun' ? 'badge-pensiun' : 'badge-mutasi'}">${row[8]}</td>
              <td>${row[9]}</td>
              <td class="center">${row[10]}</td>
              <td style="mso-number-format:'\\@';">${row[11]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="guide-box">
        <div class="guide-title">&bull; PETUNJUK RINGKAS PENGISIAN FORM EXCEL:</div>
        <div class="guide-item"><strong>1. NIP:</strong> Wajib 18 angka standard BKN tanpa spasi/tanda hubung. Tanggal lahir, jenis kelamin, dan TMT CPNS dihitung otomatis oleh sistem.</div>
        <div class="guide-item"><strong>2. Jenis Pegawai:</strong> Wajib diisi <code>PNS</code> atau <code>PPPK</code>.</div>
        <div class="guide-item"><strong>3. Kelas Jabatan:</strong> Diisi angka 1 sampai 17 (Kadis=14, Kabid=11-12, Kasubag/JF Muda=9, JF Pertama=8, Staf Pelaksana=5-7).</div>
        <div class="guide-item"><strong>4. Jenis Jabatan:</strong> Wajib pilih salah satu: <code>Struktural</code>, <code>Fungsional</code>, atau <code>Pelaksana</code>.</div>
        <div class="guide-item"><strong>5. Status Kepegawaian:</strong> Wajib pilih salah satu: <code>Aktif</code>, <code>Pensiun</code>, atau <code>Mutasi</code>.</div>
        <div class="guide-item"><strong>6. Cara Unggah:</strong> Simpan file ini, lalu buka aplikasi SIMPEG Analitika ASN &gt; Klik "Import Data Pegawai" &gt; Pilih berkas ini.</div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Formulir_Import_Pegawai_ASN_${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Salin Format Tabel ke Clipboard (Tab-Separated Values untuk langsung di-paste di Excel/Google Sheets)
export async function copyTemplateToClipboard(): Promise<boolean> {
  try {
    const headers = EXCEL_IMPORT_COLUMNS.map(c => c.header).join('\t');
    const rows = SAMPLE_EXCEL_ROWS.map(r => r.join('\t')).join('\n');
    const tsv = `${headers}\n${rows}`;
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (e) {
    console.error('Clipboard copy error', e);
    return false;
  }
}




// Hitung Tanggal Batas Usia Pensiun (BUP)
// Standard: bulan berikutnya setelah mencapai BUP
export function hitungTanggalPensiun(tanggalLahir: string, bup: number = 58): {
  tanggalPensiun: string;
  sisaTahun: number;
  sisaBulan: number;
  isMendekatiPensiun: boolean; // Pensiun dalam 1 tahun kedepan
} {
  if (!tanggalLahir) return { tanggalPensiun: '-', sisaTahun: 0, sisaBulan: 0, isMendekatiPensiun: false };
  const birth = new Date(tanggalLahir);
  const pensionYear = birth.getFullYear() + bup;
  const pensionMonth = birth.getMonth() + 1; // Pensiun jatuh pada tgl 1 bulan berikutnya
  const pensionDate = new Date(pensionYear, pensionMonth, 1);
  
  const now = new Date();
  const diffTime = pensionDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.44);
  const sisaTahun = Math.floor(diffMonths / 12);
  const sisaBulan = Math.max(0, diffMonths % 12);
  
  return {
    tanggalPensiun: pensionDate.toISOString().split('T')[0],
    sisaTahun: Math.max(0, sisaTahun),
    sisaBulan,
    isMendekatiPensiun: diffMonths <= 12 && diffMonths >= 0,
  };
}

// Cek kelayakan Kenaikan Pangkat (KP)
// Standard: PNS umumnya diusulkan KP reguler setelah 4 tahun di pangkat terakhir
export function cekKelayakanKP(tmtPangkatTerakhir: string): {
  isLayak: boolean;
  periodeBerikutnya: string;
  tahunBerjalan: number;
} {
  if (!tmtPangkatTerakhir) return { isLayak: false, periodeBerikutnya: '-', tahunBerjalan: 0 };
  const tmt = new Date(tmtPangkatTerakhir);
  const now = new Date();
  const selisihTahun = (now.getTime() - tmt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  const isLayak = selisihTahun >= 3.8; // Menjelang 4 tahun
  return {
    isLayak,
    periodeBerikutnya: isLayak ? 'Periode April 2027 / Oktober 2027' : 'Belum Memenuhi Syarat Waktu',
    tahunBerjalan: Math.floor(selisihTahun),
  };
}

// Parser NIP BKN (18 Digit)
// Format: YYYYMMDD YYYYMM G NNN
export function parseNip(nipRaw: string): {
  isValid: boolean;
  tanggalLahir?: string;
  tahunLahir?: string;
  jenisKelamin?: 'L' | 'P';
  tmtCpns?: string;
} {
  const clean = nipRaw.replace(/\s+/g, '');
  if (clean.length !== 18 || !/^\d{18}$/.test(clean)) {
    return { isValid: false };
  }

  const yyyy = clean.substring(0, 4);
  const mm = clean.substring(4, 6);
  const dd = clean.substring(6, 8);
  const tmtY = clean.substring(8, 12);
  const tmtM = clean.substring(12, 14);
  const jkCode = clean.substring(14, 15);

  const tanggalLahir = `${yyyy}-${mm}-${dd}`;
  const tmtCpns = `${tmtY}-${tmtM}-01`;
  const jenisKelamin = jkCode === '1' ? 'L' : 'P';

  return {
    isValid: true,
    tanggalLahir,
    tahunLahir: yyyy,
    jenisKelamin,
    tmtCpns,
  };
}

// Format NIP dengan spasi standard BKN: 19850412 201001 1 004
export function formatNip(nip: string): string {
  const clean = nip.replace(/\s+/g, '');
  if (clean.length !== 18) return nip;
  return `${clean.substring(0, 8)} ${clean.substring(8, 14)} ${clean.substring(14, 15)} ${clean.substring(15, 18)}`;
}

// Format nama lengkap dengan gelar aman
export function formatNamaLengkap(p: Pick<Pegawai, 'nama' | 'gelarDepan' | 'gelarBelakang'>): string {
  if (!p) return '-';
  const mainNama = (p.nama || '').trim();
  if (!mainNama) return '-';

  const depan = (p.gelarDepan || '').trim();
  const belakang = (p.gelarBelakang || '').trim();

  // Jika nama sudah diawali gelar depan, jangan gandakan
  let prefix = '';
  if (depan && !mainNama.toLowerCase().startsWith(depan.toLowerCase())) {
    prefix = `${depan} `;
  }

  // Jika nama sudah diakhiri gelar belakang, jangan gandakan
  let suffix = '';
  if (belakang && !mainNama.toLowerCase().includes(belakang.toLowerCase())) {
    suffix = `, ${belakang}`;
  }

  return `${prefix}${mainNama}${suffix}`;
}

// Format tanggal Bahasa Indonesia (e.g. 15 Januari 2026)
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Generate CSV export data
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\r\n');

  // Prepend UTF-8 BOM so Microsoft Excel loads Indonesian accents correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
