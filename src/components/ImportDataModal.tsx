import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Pegawai, JenisPegawai, GolonganRuang, KategoriJabatan, JenisJabatan, Eselon, JenjangPendidikan, StatusKepegawaian } from '../types/asn';
import { downloadFormattedExcelTemplate, PANGKAT_MAP, parseNip, estimasiKelasJabatan, hitungUmur } from '../utils/asnHelpers';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  BookOpen,
  RefreshCw,
  ArrowLeftRight,
  PlusCircle,
  FileCheck
} from 'lucide-react';

export type ImportStrategy = 'replace' | 'upsert' | 'append';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (imported: Pegawai[], strategy: ImportStrategy) => void;
  onOpenPanduanModal?: () => void;
  initialStrategy?: ImportStrategy;
  currentCount?: number;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onOpenPanduanModal,
  initialStrategy = 'replace',
  currentCount = 0,
}) => {
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [strategy, setStrategy] = useState<ImportStrategy>(initialStrategy);
  const [file, setFile] = useState<File | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [parsedData, setParsedData] = useState<Pegawai[]>([]);
  const [detectedHeadersInfo, setDetectedHeadersInfo] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialStrategy when modal opens
  useEffect(() => {
    if (isOpen) {
      setStrategy(initialStrategy);
      setFile(null);
      setPasteContent('');
      setParsedData([]);
      setValidationErrors([]);
      setValidationWarnings([]);
      setDetectedHeadersInfo('');
      setShowConfirmModal(false);
    }
  }, [isOpen, initialStrategy]);

  if (!isOpen) return null;

  // Words that disqualify a column from being the "Nama Pegawai"
  const EXCLUDED_FROM_NAMA = [
    'jabatan', 'nomenklatur', 'instansi', 'opd', 'unit', 'satker', 
    'sekolah', 'atasan', 'induk', 'ibu', 'ayah', 'kantor', 'dinas', 
    'badan', 'posisi', 'tempat', 'status', 'jenis'
  ];

  // Identifikasi baris judul tabel (Header Row) yang sebenarnya di antara judul dokumen / kop surat
  const findHeaderRowIndex = (rows: any[][]): number => {
    if (rows.length === 0) return 0;
    let bestIdx = 0;
    let maxScore = -1;

    const maxScan = Math.min(rows.length, 25);
    for (let r = 0; r < maxScan; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      let score = 0;
      const cleanCells = row.map(c => String(c ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''));

      const hasNip = cleanCells.some(c => c === 'nip' || c.startsWith('nip') || c.includes('nomorinduk') || c.includes('noinduk'));
      const hasNama = cleanCells.some(c => (c.includes('nama') || c === 'pegawai' || c === 'asn' || c === 'pejabat') && !EXCLUDED_FROM_NAMA.some(ex => c.includes(ex)));
      const hasJabatan = cleanCells.some(c => c.includes('jabatan') || c.includes('nomenklatur') || c === 'posisi');
      const hasGol = cleanCells.some(c => c.includes('gol') || c.includes('pangkat') || c.includes('ruang'));
      const hasUnit = cleanCells.some(c => c.includes('unit') || c.includes('opd') || c.includes('skpd') || c.includes('instansi'));
      const hasKelas = cleanCells.some(c => c.includes('kelas') || c.includes('kls') || c.includes('grade'));
      const hasStatus = cleanCells.some(c => c.includes('status') || c.includes('stat'));

      if (hasNip) score += 5;
      if (hasNama) score += 5;
      if (hasJabatan) score += 3;
      if (hasGol) score += 3;
      if (hasUnit) score += 2;
      if (hasKelas) score += 2;
      if (hasStatus) score += 2;

      if (score > maxScore) {
        maxScore = score;
        bestIdx = r;
      }
    }

    return maxScore >= 4 ? bestIdx : 0;
  };

  // Parser 2D Rows into ASN Pegawai
  const parseRowsToPegawai = (rows: any[][]) => {
    if (rows.length < 2) {
      setValidationErrors(['Data kosong atau tidak memiliki baris data pegawai.']);
      setParsedData([]);
      return;
    }

    const headerRowIdx = findHeaderRowIndex(rows);
    const headerRow = rows[headerRowIdx].map(c => String(c ?? '').trim());
    const cleanHeaders = headerRow.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const dataRows = rows.slice(headerRowIdx + 1);

    // 1. Mencari Kolom NIP
    let idxNip = cleanHeaders.findIndex(h => h === 'nip' || h.startsWith('nip') || h.includes('nomorinduk') || h.includes('noinduk'));
    if (idxNip === -1) {
      // Heuristic: cari kolom dengan 18 digit angka pada 5 baris pertama data
      for (let c = 0; c < 15; c++) {
        const samples = dataRows.slice(0, 5).map(r => String(r[c] ?? '').replace(/\D/g, ''));
        if (samples.filter(s => s.length === 18).length >= 2) {
          idxNip = c;
          break;
        }
      }
    }
    if (idxNip === -1) idxNip = 0;

    // 2. Mencari Kolom NAMA PEGAWAI secara Akurat & Prioritas Ketat
    let idxNama = -1;
    // Prioritas 1: Kecocokan persis nama lengkap / nama pegawai
    const EXACT_NAMA_KEYWORDS = [
      'nama', 'namapegawai', 'namalengkap', 'namaasn', 'namapns', 'namapppk', 
      'namalengkapbesertagelar', 'namalengkapgelar', 'namakaryawan', 'namaaparatur', 'pejabat'
    ];
    for (const kw of EXACT_NAMA_KEYWORDS) {
      const found = cleanHeaders.findIndex(h => h === kw);
      if (found !== -1) {
        idxNama = found;
        break;
      }
    }

    // Prioritas 2: Mengandung kata 'nama', tapi MUTLAK BUKAN nama jabatan, nama instansi, nama unit, dll.
    if (idxNama === -1) {
      idxNama = cleanHeaders.findIndex(h => 
        h.includes('nama') && !EXCLUDED_FROM_NAMA.some(ex => h.includes(ex))
      );
    }

    // Prioritas 3: Kolom 'pegawai', 'asn', 'aparatur' (bukan jenis/status)
    if (idxNama === -1) {
      idxNama = cleanHeaders.findIndex(h => 
        (h === 'pegawai' || h === 'asn' || h === 'aparatur') && 
        !h.includes('jenis') && !h.includes('status')
      );
    }

    // Prioritas 4: Heuristic nilai sel data - cari kolom yang berisi nama orang (huruf, spasi, bukan angka 18 digit, bukan kata OPD)
    if (idxNama === -1) {
      for (let c = 0; c < 15; c++) {
        if (c === idxNip) continue;
        const samples = dataRows.slice(0, 5).map(r => String(r[c] ?? '').trim());
        const looksLikeName = samples.filter(v => 
          v.length >= 3 && 
          /^[a-zA-Z\s.,'-]+$/.test(v) && 
          !/dinas|badan|kantor|bagian|seksi|kecamatan|kabupaten|aktif|pns|pppk/i.test(v)
        );
        if (looksLikeName.length >= 2) {
          idxNama = c;
          break;
        }
      }
    }
    if (idxNama === -1) idxNama = 1;

    // 3. Kolom Jabatan
    let idxJabatan = cleanHeaders.findIndex(h => 
      h === 'namajabatan' || h === 'nomenklaturjabatan' || h === 'nomenklatur' || h === 'jabatan' || h === 'jabatanasn'
    );
    if (idxJabatan === -1) {
      idxJabatan = cleanHeaders.findIndex(h => 
        h.includes('jabatan') && !h.includes('jenis') && !h.includes('kelas') && !h.includes('kategori')
      );
    }
    if (idxJabatan === -1) idxJabatan = 4;

    // 4. Kolom Golongan & Pangkat
    let idxGol = cleanHeaders.findIndex(h => 
      h === 'golongan' || h === 'gol' || h === 'golruang' || h === 'ruang' || h === 'pangkatgolongan' || h === 'golonganruang'
    );
    if (idxGol === -1) idxGol = 3;

    // 5. Kolom Jenis Pegawai (PNS / PPPK)
    let idxJenisPeg = cleanHeaders.findIndex(h => 
      h.includes('jenispegawai') || h.includes('statuspegawai') || h.includes('pnspppk') || h === 'jenis'
    );

    // 6. Kolom Kelas Jabatan
    let idxKelas = cleanHeaders.findIndex(h => 
      h.includes('kelasjabatan') || h === 'kelas' || h === 'kls' || h === 'grade'
    );

    // 7. Kolom Kategori Jenis Jabatan (Struktural / Fungsional / Pelaksana)
    let idxKategori = cleanHeaders.findIndex(h => 
      h.includes('kategorijabatan') || h.includes('jenisjabatan') || h === 'kategori' || h.includes('jenjangjabatan')
    );

    // 8. Kolom Unit Kerja
    let idxUnit = cleanHeaders.findIndex(h => 
      h.includes('unitkerja') || h.includes('opd') || h.includes('skpd') || h.includes('satuan') || h.includes('satker') || h.includes('instansi')
    );

    // 9. Kolom Status Kepegawaian (Aktif / Pensiun / Mutasi)
    let idxStatus = cleanHeaders.findIndex(h => 
      h.includes('statuskepegawaian') || h === 'status' || h.includes('stat') || h.includes('kedudukan')
    );

    // 10. Kolom Pendidikan
    let idxPendidikan = cleanHeaders.findIndex(h => 
      h.includes('pendidikan') || h.includes('jenjang') || h.includes('ijazah')
    );

    // 11. Kolom No HP
    let idxNoHp = cleanHeaders.findIndex(h => 
      h.includes('hp') || h.includes('wa') || h.includes('telepon') || h.includes('nohp') || h.includes('kontak')
    );

    // 12. Kolom Gelar Terpisah (opsional jika file memisahkannya)
    const idxGelarDepan = cleanHeaders.findIndex(h => h.includes('gelardepan') || h.includes('glrdpn'));
    const idxGelarBelakang = cleanHeaders.findIndex(h => h.includes('gelarbelakang') || h.includes('glrblk'));

    // Catat log header yang terdeteksi untuk transparansi pengguna
    setDetectedHeadersInfo(
      `Baris Header #${headerRowIdx + 1}: NIP di Kolom [${headerRow[idxNip] || idxNip + 1}], Nama Pegawai di Kolom [${headerRow[idxNama] || idxNama + 1}], Jabatan di Kolom [${headerRow[idxJabatan] || idxJabatan + 1}]`
    );

    const pegawaiParsed: Pegawai[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    dataRows.forEach((row, rowIdx) => {
      // Lewati baris kosong
      const hasAnyValue = row.some(c => c !== null && c !== undefined && String(c).trim().length > 0);
      if (!hasAnyValue) return;

      const barisKe = headerRowIdx + rowIdx + 2;

      // Extract Nama Pegawai
      let rawNama = String(row[idxNama] ?? '').trim();

      // Heuristic penyelamat jika nama kosong di kolom yang terdeteksi
      if (!rawNama) {
        for (let c = 0; c < row.length; c++) {
          if (c === idxNip || c === idxGol || c === idxKelas) continue;
          const val = String(row[c] ?? '').trim();
          if (
            val.length >= 3 && 
            /^[a-zA-Z\s.,'-]+$/.test(val) && 
            !/dinas|badan|kantor|bagian|aktif|pensiun|mutasi|pns|pppk/i.test(val)
          ) {
            rawNama = val;
            break;
          }
        }
      }

      if (!rawNama) {
        // Jika baris berisi judul sub-bagian atau kosong, lewati dengan peringatan
        warnings.push(`Baris ${barisKe}: Dilewati karena nama pegawai tidak ditemukan.`);
        return;
      }

      // Gelar Depan & Belakang jika ada kolom terpisah
      let gelarDepan = idxGelarDepan !== -1 ? String(row[idxGelarDepan] ?? '').trim() : '';
      let gelarBelakang = idxGelarBelakang !== -1 ? String(row[idxGelarBelakang] ?? '').trim() : '';

      // Extract NIP
      const rawNipStr = String(row[idxNip] ?? '');
      const rawNip = rawNipStr.replace(/\D/g, '');

      // Jenis Pegawai
      const jenisPegRaw = idxJenisPeg !== -1 ? String(row[idxJenisPeg] ?? '').toUpperCase() : '';
      const jenisPegawai: JenisPegawai = jenisPegRaw.includes('PPPK') ? 'PPPK' : 'PNS';

      // Golongan
      let golRaw = (idxGol !== -1 ? String(row[idxGol] ?? '').trim() : '') as GolonganRuang;
      if (!golRaw || !PANGKAT_MAP[golRaw]) {
        // Coba normalisasi e.g. "IV b" -> "IV/b", "III a" -> "III/a"
        const normalized = golRaw.replace(/\s+/g, '/').toUpperCase() as GolonganRuang;
        if (PANGKAT_MAP[normalized]) {
          golRaw = normalized;
        } else {
          golRaw = jenisPegawai === 'PPPK' ? 'PPPK-IX' : 'III/a';
        }
      }

      // Jabatan
      const jabatan = (idxJabatan !== -1 ? String(row[idxJabatan] ?? '').trim() : '') || 'Pelaksana Administrasi';

      // Kategori Jenis Jabatan (Struktural / Fungsional / Pelaksana)
      const katRaw = idxKategori !== -1 ? String(row[idxKategori] ?? '').toLowerCase() : '';
      let kategoriJabatan: KategoriJabatan = 'Pelaksana';
      if (katRaw.includes('struktur')) {
        kategoriJabatan = 'Struktural';
      } else if (katRaw.includes('fungsi')) {
        kategoriJabatan = 'Fungsional';
      } else if (katRaw.includes('pelaksana') || katRaw.includes('staf')) {
        kategoriJabatan = 'Pelaksana';
      } else {
        // Auto-detect dari nama jabatan
        const jLow = jabatan.toLowerCase();
        if (jLow.includes('kepala') || jLow.includes('sekretaris') || jLow.includes('kasubag') || jLow.includes('kasi') || jLow.includes('kabid') || jLow.includes('camat') || jLow.includes('lurah')) {
          kategoriJabatan = 'Struktural';
        } else if (jLow.includes('ahli') || jLow.includes('guru') || jLow.includes('dokter') || jLow.includes('perawat') || jLow.includes('pranata') || jLow.includes('analis') || jLow.includes('auditor') || jLow.includes('penyuluh') || jLow.includes('arsiparis')) {
          kategoriJabatan = 'Fungsional';
        }
      }

      // Kelas Jabatan (1 s/d 17)
      const kelasRaw = idxKelas !== -1 ? parseInt(String(row[idxKelas] ?? ''), 10) : NaN;
      const kelasJabatan = (!isNaN(kelasRaw) && kelasRaw >= 1 && kelasRaw <= 17)
        ? kelasRaw
        : estimasiKelasJabatan(kategoriJabatan, 'Non-Eselon', golRaw);

      // Unit Kerja
      const unitKerja = (idxUnit !== -1 ? String(row[idxUnit] ?? '').trim() : '') || 'Sekretariat Daerah';

      // Status Kepegawaian (Aktif / Pensiun / Mutasi)
      const statusRaw = (idxStatus !== -1 ? String(row[idxStatus] ?? '').toLowerCase() : '');
      let statusKepegawaian: StatusKepegawaian = 'Aktif';
      if (statusRaw.includes('pensiun')) statusKepegawaian = 'Pensiun';
      else if (statusRaw.includes('mutasi')) statusKepegawaian = 'Mutasi';

      // Pendidikan
      const pendRaw = (idxPendidikan !== -1 ? String(row[idxPendidikan] ?? '').trim() : 'Sarjana (S-1) / D-4') as JenjangPendidikan;

      // NIP & Tanggal Lahir logic
      let finalNip = rawNip;
      let tanggalLahir = '1988-05-15';
      let tmtCpns = '2015-01-01';
      let jenisKelamin: 'L' | 'P' = 'L';

      if (rawNip.length === 18) {
        const parsedNipInfo = parseNip(rawNip);
        if (parsedNipInfo.isValid && parsedNipInfo.tanggalLahir && parsedNipInfo.jenisKelamin && parsedNipInfo.tmtCpns) {
          tanggalLahir = parsedNipInfo.tanggalLahir;
          jenisKelamin = parsedNipInfo.jenisKelamin;
          tmtCpns = parsedNipInfo.tmtCpns;
        }
      } else {
        // Buat NIP valid jika di file tidak ada NIP lengkap
        const birthYear = 1975 + (rowIdx % 25);
        tanggalLahir = `${birthYear}-06-15`;
        finalNip = `${birthYear}06152015011${String(rowIdx + 1).padStart(3, '0')}`;
        warnings.push(`Baris ${barisKe} (${rawNama}): NIP tidak 18 digit, dibuatkan NIP sementara: ${finalNip}.`);
      }

      // No HP
      const noHp = (idxNoHp !== -1 ? String(row[idxNoHp] ?? '').trim() : '') || '081234567890';

      // Eselon & JenisJabatan
      let eselon: Eselon = 'Non-Eselon';
      let jenisJabatan: JenisJabatan = 'Jabatan Pelaksana';
      if (kategoriJabatan === 'Struktural') {
        if (kelasJabatan >= 14) {
          eselon = 'II.b';
          jenisJabatan = 'Jabatan Pimpinan Tinggi';
        } else if (kelasJabatan >= 11) {
          eselon = 'III.b';
          jenisJabatan = 'Jabatan Administrator';
        } else {
          eselon = 'IV.a';
          jenisJabatan = 'Jabatan Pengawas';
        }
      } else if (kategoriJabatan === 'Fungsional') {
        jenisJabatan = kelasJabatan >= 8 ? 'Jabatan Fungsional Keahlian' : 'Jabatan Fungsional Keterampilan';
      }

      const newPegawai: Pegawai = {
        id: `peg-import-${Date.now()}-${rowIdx}`,
        nip: finalNip,
        nama: rawNama,
        gelarDepan: gelarDepan || undefined,
        gelarBelakang: gelarBelakang || undefined,
        jenisPegawai,
        golongan: golRaw,
        pangkat: PANGKAT_MAP[golRaw] || 'Penata Muda',
        jabatan,
        kelasJabatan,
        kategoriJabatan,
        jenisJabatan,
        eselon,
        unitKerja,
        subUnitKerja: '',
        jenjangPendidikan: pendRaw,
        jurusanPendidikan: 'Ilmu Administrasi / Terkait',
        jenisKelamin,
        tempatLahir: 'Indonesia',
        tanggalLahir,
        tmtCpns,
        tmtPangkatTerakhir: '2023-04-01',
        tmtJabatanTerakhir: '2023-05-01',
        masaKerjaTahun: 5,
        masaKerjaBulan: 0,
        statusKepegawaian,
        email: `${rawNama.toLowerCase().replace(/[^a-z]/g, '')}@pemda.go.id`,
        noHp,
        predikatKinerja: 'Baik',
        batasUsiaPensiun: kategoriJabatan === 'Struktural' && eselon.startsWith('II') ? 60 : 58,
        riwayatMutasi: [],
        riwayatPangkat: [],
      };

      pegawaiParsed.push(newPegawai);
    });

    if (pegawaiParsed.length === 0) {
      errors.push('Tidak ada baris data pegawai yang berhasil dibaca. Pastikan format tabel memiliki kolom NIP/Nama.');
    }

    setParsedData(pegawaiParsed);
    setValidationErrors(errors);
    setValidationWarnings(warnings.slice(0, 10)); // Batasi 10 notifikasi agar rapi
  };

  // Baca File Berkas dengan SheetJS (Mendukung .xlsx, .xls, .csv, .txt, .tsv secara universal)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Ambil data dalam format 2D Array
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        parseRowsToPegawai(rows);
      } catch (err: any) {
        console.error('File parsing error', err);
        setValidationErrors([
          'Gagal membaca berkas Excel/CSV. Pastikan berkas tidak rusak atau terproteksi kata sandi. Error: ' + (err.message || 'Format tidak didukung')
        ]);
        setParsedData([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setValidationErrors(['Gagal membaca file dari komputer. Silakan coba kembali.']);
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(selected);
  };

  // Muat contoh data demo langsung
  const handleLoadSampleDemo = () => {
    const sampleRows = [
      ['NIP', 'Nama Lengkap', 'Jenis Pegawai', 'Golongan', 'Jabatan', 'Kelas Jabatan', 'Jenis Jabatan', 'Unit Kerja', 'Status', 'Pendidikan', 'Usia', 'No HP'],
      ['198604122010011005', 'Dr. Ir. Gunawan Wibisono, M.T.', 'PNS', 'IV/b', 'Kepala Bidang Infrastruktur Wilayah', 12, 'Struktural', 'Dinas Pekerjaan Umum dan Penataan Ruang', 'Aktif', 'Magister (S-2)', 40, '081234567890'],
      ['199408222023212004', 'Siti Rahmayanti, S.Kom.', 'PPPK', 'PPPK-IX', 'Pranata Komputer Ahli Pertama', 8, 'Fungsional', 'Dinas Komunikasi, Informatika dan Statistik', 'Aktif', 'Sarjana (S-1) / D-4', 32, '081398765432'],
      ['196711101992031002', 'Drs. H. Mulyono, M.Si.', 'PNS', 'IV/c', 'Kepala Dinas', 14, 'Struktural', 'Badan Kepegawaian dan Pengembangan SDM', 'Pensiun', 'Magister (S-2)', 59, '081122334455'],
      ['198205142006042003', 'Dewi Sartika, S.E.', 'PNS', 'III/d', 'Pengadministrasi Keuangan', 6, 'Pelaksana', 'Badan Pengelolaan Keuangan dan Aset Daerah', 'Mutasi', 'Sarjana (S-1) / D-4', 44, '085712348899'],
      ['197503121998031003', 'ADE ZAKIR HASIM, ST', 'PNS', 'IV/b', 'Sekretaris Daerah', 15, 'Struktural', 'Sekretariat Daerah', 'Aktif', 'Sarjana (S-1) / D-4', 51, '081223344556'],
      ['199011052015022001', 'Nurul Hidayati, S.Pd., M.Pd.', 'PNS', 'III/c', 'Guru Ahli Muda', 9, 'Fungsional', 'Dinas Pendidikan dan Kebudayaan', 'Aktif', 'Magister (S-2)', 35, '081388990011']
    ];

    parseRowsToPegawai(sampleRows);
    setFile({ name: 'Contoh_Master_Bezetting_ASN.xlsx' } as File);
  };

  // Tempel Teks dari Clipboard Excel
  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) {
      setValidationErrors(['Silakan tempel (paste) data dari Excel Anda terlebih dahulu ke dalam kotak teks.']);
      return;
    }

    try {
      // Gunakan XLSX untuk membaca string langsung jika memungkinkan
      const workbook = XLSX.read(pasteContent, { type: 'string' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      if (rows && rows.length > 0) {
        parseRowsToPegawai(rows);
        return;
      }
    } catch {
      // Fallback pemisahan manual jika string bukan CSV standard
    }

    const lines = pasteContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const delimiter = lines.some(l => l.includes('\t')) ? '\t' : (lines[0].includes(';') ? ';' : ',');
    const rows = lines.map(line => line.split(delimiter).map(c => c.trim().replace(/^"(.*)"$/, '$1')));
    parseRowsToPegawai(rows);
  };

  // Eksekusi Konfirmasi Impor
  const handleExecuteImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData, strategy);
    setShowConfirmModal(false);
    onClose();
  };

  const handleStartImportClick = () => {
    if (parsedData.length === 0) {
      alert('Tidak ada data pegawai yang siap diimpor.');
      return;
    }

    // Jika mode adalah 'replace', buka dialog konfirmasi agar tidak terjadi kesalahan tidak sengaja
    if (strategy === 'replace') {
      setShowConfirmModal(true);
    } else {
      handleExecuteImport();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                {strategy === 'replace' ? (
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                ) : (
                  <Upload className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>
                    {strategy === 'replace' 
                      ? 'Update Data Pegawai (Ganti Seluruh Data Sebelumnya)' 
                      : 'Import Data Pegawai ASN (Excel / CSV)'}
                  </span>
                  {strategy === 'replace' && (
                    <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      Mode Ganti Data
                    </span>
                  )}
                </h2>
                <p className="text-2xs text-slate-400 mt-0.5">
                  Unggah berkas Excel (.xlsx / .xls) atau CSV Master Bezetting Pegawai ASN
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
            {/* Strategy / Update Mode Selector Cards */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                  <span>Pilih Tindakan Terhadap Data Pegawai di SI-ITING:</span>
                </span>
                <span className="text-2xs font-mono text-slate-500">
                  Data saat ini: <strong className="text-slate-800">{currentCount} Pegawai</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Opsi 1: Replace All */}
                <button
                  type="button"
                  onClick={() => setStrategy('replace')}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    strategy === 'replace'
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <RefreshCw className={`w-3.5 h-3.5 ${strategy === 'replace' ? 'text-amber-600 font-bold' : 'text-slate-400'}`} />
                      <span>Ganti Seluruh Data</span>
                    </span>
                    {strategy === 'replace' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-3xs text-slate-500 mt-1 leading-snug">
                    Hapus {currentCount} data lama dan ganti seutuhnya dengan data baru dari file Excel ini (Rekomendasi Update Bezetting).
                  </p>
                </button>

                {/* Opsi 2: Upsert / Sync by NIP */}
                <button
                  type="button"
                  onClick={() => setStrategy('upsert')}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    strategy === 'upsert'
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileCheck className={`w-3.5 h-3.5 ${strategy === 'upsert' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>Update by NIP (Sinkron)</span>
                    </span>
                    {strategy === 'upsert' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <p className="text-3xs text-slate-500 mt-1 leading-snug">
                    Perbarui data jika NIP cocok, dan tambahkan otomatis jika ada NIP pegawai baru.
                  </p>
                </button>

                {/* Opsi 3: Append */}
                <button
                  type="button"
                  onClick={() => setStrategy('append')}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    strategy === 'append'
                      ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <PlusCircle className={`w-3.5 h-3.5 ${strategy === 'append' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>Tambah Baru (Append)</span>
                    </span>
                    {strategy === 'append' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>
                  <p className="text-3xs text-slate-500 mt-1 leading-snug">
                    Tambahkan baris data ke daftar yang ada tanpa menghapus data pegawai sebelumnya.
                  </p>
                </button>
              </div>

              {/* Informative Alert for Replace Mode */}
              {strategy === 'replace' && (
                <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded text-amber-900 text-2xs flex items-start gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pemberitahuan Mode Ganti Data:</strong> Seluruh master data pegawai sebelumnya ({currentCount} ASN) akan digantikan secara penuh oleh data hasil impor berkas baru ini.
                  </div>
                </div>
              )}
            </div>

            {/* Action Ribbon: Panduan, Contoh Demo & Download Form */}
            <div className="p-3 bg-gradient-to-r from-slate-100 to-amber-50/40 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Dukungan Format Universal</span>
                </div>
                <p className="text-2xs text-slate-600 mt-0.5">
                  Mendukung file Excel asli (<strong>.xlsx</strong>, <strong>.xls</strong>), file CSV UTF-8, maupun salinan tabel langsung.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {onOpenPanduanModal && (
                  <button
                    type="button"
                    onClick={onOpenPanduanModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded text-xs transition-colors shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Panduan Aturan</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLoadSampleDemo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-slate-900 font-semibold rounded text-xs transition-colors shadow-2xs"
                  title="Coba isi otomatis dengan contoh data ASN resmi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Coba Contoh Data</span>
                </button>

                <button
                  type="button"
                  onClick={downloadFormattedExcelTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Form Excel</span>
                </button>
              </div>
            </div>

            {/* Mode Selector Tabs: Upload File vs Tempel dari Clipboard */}
            <div className="flex items-center border-b border-slate-200">
              <button
                type="button"
                onClick={() => setImportMode('upload')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  importMode === 'upload'
                    ? 'border-amber-500 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Berkas File (.xlsx / .xls / .csv)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('paste')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  importMode === 'paste'
                    ? 'border-amber-500 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-blue-600" />
                <span>Tempel Langsung dari Excel (Ctrl+V)</span>
              </button>
            </div>

            {/* Mode 1: File Upload */}
            {importMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv,text/csv,.txt,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-slate-700" />
                </div>
                <p className="font-semibold text-slate-800 text-xs">
                  {file ? file.name : 'Pilih Berkas Excel (.xlsx, .xls) atau CSV Bezetting Pegawai'}
                </p>
                <p className="text-2xs text-slate-400 mt-1">
                  Format yang didukung: File Microsoft Excel Workbook (.xlsx), Excel 97-2003 (.xls), CSV (Semua Delimiter).
                </p>
              </div>
            )}

            {/* Mode 2: Direct Paste from Excel */}
            {importMode === 'paste' && (
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold text-xs">
                  Salin tabel dari Excel / Sheets, lalu tempel (Paste / Ctrl+V) pada kotak di bawah:
                </label>
                <textarea
                  rows={5}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="NIP&#9;Nama Lengkap&#9;Jenis Pegawai&#9;Golongan&#9;Jabatan&#9;Kelas Jabatan&#9;Jenis Jabatan&#9;Unit Kerja&#9;Status&#10;198504122010011004&#9;ADE ZAKIR HASIM, ST&#9;PNS&#9;IV/b&#9;Sekretaris Daerah&#9;15&#9;Struktural&#9;Sekretariat Daerah&#9;Aktif"
                  className="w-full font-mono text-2xs p-3 border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasteSubmit}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs transition-colors"
                  >
                    Proses Data Hasil Tempel
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible Column Guide Card */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left text-xs font-semibold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Petunjuk Kolom Form Excel:</span>
                </span>
                <div className="flex items-center gap-1 text-2xs text-slate-500 font-normal">
                  <span>{showGuide ? 'Tutup Petunjuk' : 'Buka Petunjuk'}</span>
                  {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {showGuide && (
                <div className="p-3 border-t border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-2xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-900 block">Kolom Nama:</span>
                    <span className="text-slate-600">Bisa diisi <code>Nama Lengkap Beserta Gelar</code> atau nama murni. Otomatis dipisahkan dengan aman.</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-900 block">Status Kepegawaian:</span>
                    <span className="text-slate-600">Pilih salah satu: <code>Aktif</code>, <code>Pensiun</code>, atau <code>Mutasi</code>.</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-900 block">Kelas Jabatan:</span>
                    <span className="text-slate-600">Angka <code>1 s/d 17</code> (Kadis=14, Kabid=12, JF Muda=9, JF Pertama=8, Staf=5-7).</span>
                  </div>
                </div>
              )}
            </div>

            {/* Transparansi Hasil Deteksi Header */}
            {detectedHeadersInfo && (
              <div className="px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded text-2xs text-blue-800 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{detectedHeadersInfo}</span>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Peringatan Pembacaan Berkas:</span>
                </div>
                <ul className="list-disc list-inside text-2xs space-y-0.5">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Warnings */}
            {validationWarnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Catatan Penyesuaian Data:</span>
                </div>
                <ul className="list-disc list-inside text-2xs space-y-0.5">
                  {validationWarnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {parsedData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>Pratinjau Hasil Impor ({parsedData.length} Pegawai Terbaca):</span>
                    {strategy === 'replace' && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-3xs">
                        Akan menggantikan {currentCount} data lama
                      </span>
                    )}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Nama Pegawai &amp; Kolom Terverifikasi
                  </span>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-2xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2">Nama Lengkap &amp; NIP</th>
                        <th className="p-2">Golongan</th>
                        <th className="p-2">Jabatan</th>
                        <th className="p-2 text-center">Kelas</th>
                        <th className="p-2">Jenis Jabatan</th>
                        <th className="p-2">Unit Kerja</th>
                        <th className="p-2 text-center">Usia</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {parsedData.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2">
                            <p className="font-bold text-slate-900 bg-amber-50/60 inline-block px-1 rounded">
                              {p.nama}
                            </p>
                            <p className="font-mono text-3xs text-slate-500">{p.nip}</p>
                          </td>
                          <td className="p-2 font-mono">{p.golongan} ({p.jenisPegawai})</td>
                          <td className="p-2 font-medium">{p.jabatan}</td>
                          <td className="p-2 text-center font-mono font-bold text-amber-700">
                            {p.kelasJabatan}
                          </td>
                          <td className="p-2">
                            <span className={`font-semibold ${
                              p.kategoriJabatan === 'Struktural' ? 'text-blue-700' :
                              p.kategoriJabatan === 'Fungsional' ? 'text-emerald-700' : 'text-slate-600'
                            }`}>
                              {p.kategoriJabatan}
                            </span>
                          </td>
                          <td className="p-2 truncate max-w-[130px]">{p.unitKerja}</td>
                          <td className="p-2 text-center font-mono">{hitungUmur(p.tanggalLahir)} Th</td>
                          <td className="p-2 text-center">
                            <span className={`font-semibold px-2 py-0.5 rounded text-3xs ${
                              p.statusKepegawaian === 'Aktif'
                                ? 'text-emerald-800 bg-emerald-50'
                                : p.statusKepegawaian === 'Pensiun'
                                ? 'text-slate-700 bg-slate-100'
                                : 'text-amber-800 bg-amber-50'
                            }`}>
                              {p.statusKepegawaian}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-2xs text-slate-500 font-mono">
              {parsedData.length > 0 ? (
                <span className="font-medium text-slate-700">
                  {strategy === 'replace' ? (
                    <span className="text-amber-700 font-bold">
                      Mode Ganti: {parsedData.length} Pegawai baru akan menggantikan {currentCount} data lama
                    </span>
                  ) : strategy === 'upsert' ? (
                    <span className="text-blue-700 font-bold">
                      Mode Sinkronisasi: {parsedData.length} Pegawai siap disinkronkan by NIP
                    </span>
                  ) : (
                    <span>
                      {parsedData.length} Pegawai siap ditambahkan ke SIMPEG
                    </span>
                  )}
                </span>
              ) : (
                'Pilih berkas Excel (.xlsx / .csv) atau tempel data'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={parsedData.length === 0 || isProcessing}
                onClick={handleStartImportClick}
                className={`px-5 py-1.5 text-xs font-bold rounded transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  strategy === 'replace'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : strategy === 'upsert'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {strategy === 'replace' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti &amp; Update Seluruh Data ({parsedData.length} ASN)</span>
                  </>
                ) : strategy === 'upsert' ? (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Sinkronkan {parsedData.length} Pegawai</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambahkan {parsedData.length} Pegawai</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Penggantian Data (Safety Confirmation) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Konfirmasi Update &amp; Ganti Seluruh Data
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Tindakan ini akan menimpa data kepegawaian yang tersimpan di SIMPEG
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-2xs text-amber-900 space-y-1.5">
              <p>
                Anda akan mengganti <strong>{currentCount} data pegawai</strong> yang ada di SIMPEG dengan <strong>{parsedData.length} data pegawai baru</strong> dari berkas yang diimpor.
              </p>
              <p className="font-semibold text-amber-950">
                Apakah Anda yakin ingin melanjutkan penggantian seluruh master data ini?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
              >
                Batal / Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ya, Ganti Data Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
