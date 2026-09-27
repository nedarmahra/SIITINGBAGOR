import React, { useState, useMemo } from 'react';
import { Pegawai, StatusKepegawaian } from '../types/asn';
import { formatNip, formatNamaLengkap, formatTanggalIndo, hitungUmur, hitungTanggalPensiun, exportToCSV, downloadImportTemplate, downloadFormattedExcelTemplate } from '../utils/asnHelpers';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BookOpen,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

interface DataPegawaiViewProps {
  pegawaiList: Pegawai[];
  onSelectPegawai: (pegawai: Pegawai) => void;
  onEditPegawai: (pegawai: Pegawai) => void;
  onDeletePegawai: (pegawaiId: string) => void;
  onTambahPegawai: () => void;
  onOpenImportModal: (strategy?: 'replace' | 'upsert' | 'append') => void;
  onOpenPanduanModal?: () => void;
  onResetDefaultData?: () => void;
}

export const DataPegawaiView: React.FC<DataPegawaiViewProps> = ({
  pegawaiList,
  onSelectPegawai,
  onEditPegawai,
  onDeletePegawai,
  onTambahPegawai,
  onOpenImportModal,
  onOpenPanduanModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpd, setFilterOpd] = useState('all');
  const [filterJenis, setFilterJenis] = useState('all');
  const [filterKategoriJabatan, setFilterKategoriJabatan] = useState('all');
  const [filterKelasJabatan, setFilterKelasJabatan] = useState('all');
  const [filterGolongan, setFilterGolongan] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nama' | 'nip' | 'golongan' | 'kelasJabatan' | 'usia' | 'status' | 'masaKerja'>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    return pegawaiList
      .filter(p => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNama = p.nama.toLowerCase().includes(q);
          const matchNip = p.nip.includes(q);
          const matchJabatan = p.jabatan.toLowerCase().includes(q);
          const matchUnit = p.unitKerja.toLowerCase().includes(q);
          if (!matchNama && !matchNip && !matchJabatan && !matchUnit) return false;
        }

        // OPD filter
        if (filterOpd !== 'all' && p.unitKerja !== filterOpd) return false;

        // Jenis Pegawai filter (PNS / PPPK)
        if (filterJenis !== 'all' && p.jenisPegawai !== filterJenis) return false;

        // Kategori Jabatan filter (Struktural / Fungsional / Pelaksana)
        if (filterKategoriJabatan !== 'all' && p.kategoriJabatan !== filterKategoriJabatan) return false;

        // Kelas Jabatan filter
        if (filterKelasJabatan !== 'all' && p.kelasJabatan !== Number(filterKelasJabatan)) return false;

        // Golongan filter
        if (filterGolongan !== 'all') {
          if (filterGolongan === 'IV' && !p.golongan.startsWith('IV')) return false;
          if (filterGolongan === 'III' && !p.golongan.startsWith('III')) return false;
          if (filterGolongan === 'II' && !p.golongan.startsWith('II')) return false;
          if (filterGolongan === 'I' && !p.golongan.startsWith('I/')) return false;
          if (filterGolongan === 'PPPK' && p.jenisPegawai !== 'PPPK') return false;
        }

        // Status Kepegawaian filter (Aktif / Pensiun / Mutasi)
        if (filterStatus !== 'all' && p.statusKepegawaian !== filterStatus) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'nama') {
          comp = a.nama.localeCompare(b.nama);
        } else if (sortBy === 'nip') {
          comp = a.nip.localeCompare(b.nip);
        } else if (sortBy === 'golongan') {
          comp = b.golongan.localeCompare(a.golongan);
        } else if (sortBy === 'kelasJabatan') {
          comp = b.kelasJabatan - a.kelasJabatan;
        } else if (sortBy === 'usia') {
          comp = hitungUmur(a.tanggalLahir) - hitungUmur(b.tanggalLahir);
        } else if (sortBy === 'status') {
          comp = a.statusKepegawaian.localeCompare(b.statusKepegawaian);
        } else if (sortBy === 'masaKerja') {
          comp = a.masaKerjaTahun - b.masaKerjaTahun;
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [pegawaiList, searchQuery, filterOpd, filterJenis, filterKategoriJabatan, filterKelasJabatan, filterGolongan, filterStatus, sortBy, sortOrder]);

  // Paginated items
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // Distinct OPDs
  const distinctOpds = useMemo(() => {
    return Array.from(new Set(pegawaiList.map(p => p.unitKerja))).sort();
  }, [pegawaiList]);

  // Handle Sort Toggle
  const handleSort = (field: 'nama' | 'nip' | 'golongan' | 'kelasJabatan' | 'usia' | 'status' | 'masaKerja') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Export all current filtered pegawai to CSV/Excel
  const handleExportDataPegawai = () => {
    const headers = [
      'No',
      'NIP',
      'Nama Lengkap',
      'Gelar Depan',
      'Gelar Belakang',
      'Jenis Pegawai',
      'Golongan',
      'Pangkat',
      'Jabatan',
      'Kelas Jabatan',
      'Jenis Jabatan',
      'Eselon',
      'Satuan Kerja / Unit Kerja',
      'Sub Unit Kerja',
      'Usia (Tahun)',
      'Status Kepegawaian',
      'Jenjang Pendidikan',
      'Jurusan',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'TMT CPNS',
      'Masa Kerja Tahun',
      'Masa Kerja Bulan',
      'Email',
      'No HP',
      'Predikat Kinerja',
    ];

    const rows = filteredAndSorted.map((p, idx) => [
      idx + 1,
      formatNip(p.nip),
      p.nama,
      p.gelarDepan || '',
      p.gelarBelakang || '',
      p.jenisPegawai,
      p.golongan,
      p.pangkat,
      p.jabatan,
      p.kelasJabatan,
      p.kategoriJabatan,
      p.eselon,
      p.unitKerja,
      p.subUnitKerja || '',
      hitungUmur(p.tanggalLahir),
      p.statusKepegawaian,
      p.jenjangPendidikan,
      p.jurusanPendidikan,
      p.jenisKelamin,
      p.tempatLahir,
      p.tanggalLahir,
      p.tmtCpns,
      p.masaKerjaTahun,
      p.masaKerjaBulan,
      p.email,
      p.noHp,
      p.predikatKinerja,
    ]);

    exportToCSV(`Data_Pegawai_ASN_Export_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-3xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                Bagian Organisasi Setda Kab. Bandung Barat
              </span>
              <span className="text-3xs font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                SI-ITING
              </span>
              <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 italic border border-slate-200">
                “Data Tepat, Keputusan Tepat”
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Pangkalan Data Master Bezetting Pegawai ASN · SI-ITING
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pangkalan data induk aparatur sipil negara Pemerintah Kabupaten Bandung Barat dengan rincian jabatan, kelas, golongan, usia, status, dan unit kerja penempatan.
            </p>
          </div>

          {/* Action Button Strip: Update/Ganti, Import, Export, Download Template, Add ASN */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Utama Permintaan Pengguna: Update Data Pegawai (Import & Ganti data sebelumnya) */}
            <button
              onClick={() => onOpenImportModal('replace')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-sm ring-1 ring-amber-500/50"
              title="Import file Excel/CSV baru dan GANTI seluruh data pegawai sebelumnya"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-900" />
              <span>Update Data Pegawai (Ganti Data)</span>
            </button>

            {/* Import & Tambah Data Pegawai */}
            <button
              onClick={() => onOpenImportModal('append')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
              title="Import file Excel/CSV dan tambahkan ke data yang sudah ada"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Import &amp; Tambah Data</span>
            </button>

            {/* Download Template Form & Panduan Pengisian */}
            <button
              onClick={() => {
                if (onOpenPanduanModal) {
                  onOpenPanduanModal();
                } else {
                  downloadFormattedExcelTemplate();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors shadow-2xs"
              title="Buka panduan mudah pengisian & unduh format Excel resmi (.xls / .csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Download Form Excel</span>
            </button>

            {/* Export Data Pegawai */}
            <button
              onClick={handleExportDataPegawai}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Data ASN</span>
            </button>

            {/* Tambah Pegawai Baru */}
            <button
              onClick={onTambahPegawai}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Tambah Pegawai</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari NIP, Nama Lengkap, Jabatan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
            />
          </div>

          {/* Unit Kerja Filter */}
          <div>
            <select
              value={filterOpd}
              onChange={(e) => {
                setFilterOpd(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Semua Satuan Kerja</option>
              {distinctOpds.map(opd => (
                <option key={opd} value={opd}>{opd}</option>
              ))}
            </select>
          </div>

          {/* Jenis Jabatan Filter (Struktural / Fungsional / Pelaksana) */}
          <div>
            <select
              value={filterKategoriJabatan}
              onChange={(e) => {
                setFilterKategoriJabatan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="all">Jenis: Semua Jabatan</option>
              <option value="Struktural">Struktural</option>
              <option value="Fungsional">Fungsional</option>
              <option value="Pelaksana">Pelaksana</option>
            </select>
          </div>

          {/* Status Filter (Aktif / Pensiun / Mutasi) */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
            >
              <option value="all">Status: Semua Status</option>
              <option value="Aktif">Status: Aktif</option>
              <option value="Pensiun">Status: Pensiun</option>
              <option value="Mutasi">Status: Mutasi</option>
            </select>
          </div>

          {/* Golongan Filter */}
          <div>
            <select
              value={filterGolongan}
              onChange={(e) => {
                setFilterGolongan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Semua Golongan</option>
              <option value="IV">Golongan IV (Pembina)</option>
              <option value="III">Golongan III (Penata)</option>
              <option value="II">Golongan II (Pengatur)</option>
              <option value="I">Golongan I (Juru)</option>
              <option value="PPPK">Semua PPPK</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table with Separated Jabatan, Kelas Jabatan, Jenis Jabatan, Unit Kerja, Usia, and Status */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              Menampilkan <strong className="font-mono text-slate-900">{filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> - <strong className="font-mono text-slate-900">{Math.min(currentPage * pageSize, filteredAndSorted.length)}</strong> dari <strong className="font-mono text-slate-900">{filteredAndSorted.length}</strong> personel
              {filteredAndSorted.length !== pegawaiList.length && (
                <span className="text-slate-400"> (disaring dari {pegawaiList.length} total)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label htmlFor="pageSizeSelectTop" className="text-slate-600 font-medium whitespace-nowrap text-2xs uppercase tracking-wider">
              Tampilkan:
            </label>
            <select
              id="pageSizeSelectTop"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
            >
              <option value={10}>10 personel</option>
              <option value={20}>20 personel</option>
              <option value={50}>50 personel</option>
              <option value={100}>100 personel</option>
            </select>
            <span className="text-slate-400 font-mono text-2xs hidden md:inline border-l border-slate-300 pl-2">
              Hal. {currentPage}/{totalPages}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th 
                  onClick={() => handleSort('nama')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama & NIP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('golongan')}
                  className="py-2.5 px-2 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Gol / Pangkat</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                {/* Kolom Jabatan Terpisah */}
                <th className="py-2.5 px-3">Jabatan</th>
                {/* Kolom Kelas Jabatan */}
                <th 
                  onClick={() => handleSort('kelasJabatan')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-200/60 transition-colors font-mono"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Kelas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                {/* Kolom Jenis Jabatan (Struktural / Fungsional / Pelaksana) */}
                <th className="py-2.5 px-2 text-center">Jenis Jabatan</th>
                {/* Kolom Unit Kerja Terpisah */}
                <th className="py-2.5 px-3">Satuan Kerja / Unit Kerja</th>
                {/* 1. Tambahkan Kolom Usia */}
                <th 
                  onClick={() => handleSort('usia')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-200/60 transition-colors font-mono"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Usia</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                {/* 2. Tambahkan Kolom Status (Aktif / Pensiun / Mutasi) */}
                <th 
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data pegawai yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedList.map((p, idx) => {
                  const nomor = (currentPage - 1) * pageSize + idx + 1;
                  const age = hitungUmur(p.tanggalLahir);
                  const pen = hitungTanggalPensiun(p.tanggalLahir, p.batasUsiaPensiun);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{nomor}</td>
                      
                      {/* Nama & NIP */}
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900">{formatNamaLengkap(p)}</p>
                        <p className="font-mono text-2xs text-slate-500 mt-0.5">{formatNip(p.nip)}</p>
                      </td>

                      {/* Golongan & Pangkat */}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">{p.golongan}</span>
                          <span className="text-2xs text-slate-500 font-mono">({p.jenisPegawai})</span>
                        </div>
                        <p className="text-2xs text-slate-600 mt-0.5 leading-snug break-words">{p.pangkat}</p>
                      </td>

                      {/* Kolom Jabatan Terpisah */}
                      <td className="py-2.5 px-3 min-w-[160px]">
                        <p className="font-medium text-slate-800 leading-snug break-words">{p.jabatan}</p>
                        <p className="text-2xs text-slate-400">{p.eselon !== 'Non-Eselon' ? `Eselon ${p.eselon}` : ''}</p>
                      </td>

                      {/* Kolom Kelas Jabatan */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {p.kelasJabatan}
                        </span>
                      </td>

                      {/* Kolom Jenis Jabatan (Struktural / Fungsional / Pelaksana) */}
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-semibold text-2xs px-2 py-0.5 rounded ${
                          p.kategoriJabatan === 'Struktural'
                            ? 'text-blue-800 bg-blue-50'
                            : p.kategoriJabatan === 'Fungsional'
                            ? 'text-emerald-800 bg-emerald-50'
                            : 'text-slate-700 bg-slate-100'
                        }`}>
                          {p.kategoriJabatan}
                        </span>
                      </td>

                      {/* Kolom Unit Kerja Terpisah */}
                      <td className="py-2.5 px-3 min-w-[180px]">
                        <p className="font-semibold text-slate-900 leading-snug break-words">{p.unitKerja}</p>
                        {p.subUnitKerja && (
                          <p className="text-2xs text-slate-500 mt-0.5 leading-snug break-words">{p.subUnitKerja}</p>
                        )}
                      </td>

                      {/* 1. Kolom Usia */}
                      <td className="py-2.5 px-2 text-center font-mono">
                        <span className="text-slate-800 font-medium">{age} Th</span>
                        {pen.isMendekatiPensiun && (
                          <span className="block text-3xs text-rose-600 font-sans font-semibold">BUP Dekat</span>
                        )}
                      </td>

                      {/* 2. Kolom Status (Aktif / Pensiun / Mutasi) */}
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-semibold text-2xs px-2.5 py-0.5 rounded ${
                          p.statusKepegawaian === 'Aktif'
                            ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                            : p.statusKepegawaian === 'Pensiun'
                            ? 'text-slate-700 bg-slate-100 border border-slate-300'
                            : 'text-amber-800 bg-amber-50 border border-amber-200'
                        }`}>
                          {p.statusKepegawaian}
                        </span>
                      </td>

                      {/* Tindakan */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectPegawai(p)}
                            title="Lihat Profil Lengkap"
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPegawai(p)}
                            title="Edit Data Pegawai"
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus data pegawai "${p.nama}"?`)) {
                                onDeletePegawai(p.id);
                              }
                            }}
                            title="Hapus Pegawai"
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredAndSorted.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-600">
              <span className="font-mono">
                Menampilkan <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredAndSorted.length)}</strong> dari <strong className="text-slate-900">{filteredAndSorted.length}</strong> personel
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <label htmlFor="pageSizeSelectBottom" className="text-2xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Tampilkan:
                </label>
                <select
                  id="pageSizeSelectBottom"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value={10}>10 personel</option>
                  <option value={20}>20 personel</option>
                  <option value={50}>50 personel</option>
                  <option value={100}>100 personel</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
                      acc.push(`dots-${page}`);
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item) => {
                    if (typeof item === 'string') {
                      return (
                        <span key={item} className="px-1 text-slate-400 font-mono">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                          currentPage === item
                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
