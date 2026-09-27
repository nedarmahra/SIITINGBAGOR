import React, { useState, useMemo } from 'react';
import { Pegawai, GolonganRuang } from '../types/asn';
import { FORMASI_ABK_MAP, hitungTanggalPensiun, cekKelayakanKP, hitungUmur, exportToCSV, formatNip, formatTanggalIndo } from '../utils/asnHelpers';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Building, 
  Layers, 
  GraduationCap, 
  Calendar, 
  Award,
  ChevronRight,
  BarChart3,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { RecapitulasiGrafik } from './RecapitulasiGrafik';

interface RecapitulasiViewProps {
  pegawaiList: Pegawai[];
  onOpenCetakModal: (kategori: string, dataTable: any) => void;
  onSelectPegawai: (pegawai: Pegawai) => void;
}

export const RecapitulasiView: React.FC<RecapitulasiViewProps> = ({
  pegawaiList,
  onOpenCetakModal,
  onSelectPegawai,
}) => {
  const [activeRecapTab, setActiveRecapTab] = useState<'opd' | 'golongan' | 'kelas_jabatan' | 'jabatan_pendidikan' | 'pensiun' | 'kp'>('opd');

  // 1. Rekapitulasi per Unit Kerja / OPD
  const rekapOpd = useMemo(() => {
    return Object.keys(FORMASI_ABK_MAP).map(opd => {
      const staff = pegawaiList.filter(p => p.unitKerja === opd);
      const pnsL = staff.filter(p => p.jenisPegawai === 'PNS' && p.jenisKelamin === 'L').length;
      const pnsP = staff.filter(p => p.jenisPegawai === 'PNS' && p.jenisKelamin === 'P').length;
      const totalPns = pnsL + pnsP;

      const pppkL = staff.filter(p => p.jenisPegawai === 'PPPK' && p.jenisKelamin === 'L').length;
      const pppkP = staff.filter(p => p.jenisPegawai === 'PPPK' && p.jenisKelamin === 'P').length;
      const totalPppk = pppkL + pppkP;

      const totalEksisting = totalPns + totalPppk;
      const kuotaAbk = FORMASI_ABK_MAP[opd] || 0;
      const selisih = totalEksisting - kuotaAbk;

      const avgAge = staff.length > 0 
        ? Math.round(staff.reduce((acc, p) => acc + hitungUmur(p.tanggalLahir), 0) / staff.length)
        : 0;

      return {
        unitKerja: opd,
        pnsL,
        pnsP,
        totalPns,
        pppkL,
        pppkP,
        totalPppk,
        totalEksisting,
        kuotaAbk,
        selisih,
        avgAge,
      };
    });
  }, [pegawaiList]);

  // Grand totals for Rekap OPD
  const grandTotalOpd = useMemo(() => {
    return rekapOpd.reduce((acc, row) => ({
      pnsL: acc.pnsL + row.pnsL,
      pnsP: acc.pnsP + row.pnsP,
      totalPns: acc.totalPns + row.totalPns,
      pppkL: acc.pppkL + row.pppkL,
      pppkP: acc.pppkP + row.pppkP,
      totalPppk: acc.totalPppk + row.totalPppk,
      totalEksisting: acc.totalEksisting + row.totalEksisting,
      kuotaAbk: acc.kuotaAbk + row.kuotaAbk,
      selisih: acc.selisih + row.selisih,
    }), { pnsL: 0, pnsP: 0, totalPns: 0, pppkL: 0, pppkP: 0, totalPppk: 0, totalEksisting: 0, kuotaAbk: 0, selisih: 0 });
  }, [rekapOpd]);

  // 1b. Rekapitulasi per Kelas Jabatan (1 s/d 17)
  const rekapKelasJabatan = useMemo(() => {
    const totalPeg = pegawaiList.length || 1;
    const rows = [];
    for (let k = 17; k >= 1; k--) {
      const match = pegawaiList.filter(p => p.kelasJabatan === k);
      const pns = match.filter(p => p.jenisPegawai === 'PNS').length;
      const pppk = match.filter(p => p.jenisPegawai === 'PPPK').length;
      const total = match.length;
      const persentase = ((total / totalPeg) * 100).toFixed(1);
      
      let keterangan = 'Staf Pelaksana Dasar';
      if (k >= 14) keterangan = 'Jabatan Pimpinan Tinggi (JPT Utama / Madya / Pratama)';
      else if (k >= 11) keterangan = 'Jabatan Administrator (Eselon III) / JF Madya';
      else if (k >= 9) keterangan = 'Jabatan Pengawas (Eselon IV) / JF Muda';
      else if (k >= 8) keterangan = 'Jabatan Fungsional Ahli Pertama';
      else if (k >= 6) keterangan = 'Jabatan Fungsional Keterampilan / Pelaksana Lanjutan';

      rows.push({
        kelas: k,
        keterangan,
        pns,
        pppk,
        total,
        persentase,
      });
    }
    return rows.filter(r => r.total > 0 || [15, 14, 12, 11, 9, 8, 7, 5].includes(r.kelas));
  }, [pegawaiList]);


  // 2. Rekapitulasi per Golongan & Ruang
  const rekapGolongan = useMemo(() => {
    const listGolongan: { golongan: GolonganRuang; tier: string; namaPangkat: string }[] = [
      { golongan: 'IV/e', tier: 'Golongan IV', namaPangkat: 'Pembina Utama' },
      { golongan: 'IV/d', tier: 'Golongan IV', namaPangkat: 'Pembina Utama Madya' },
      { golongan: 'IV/c', tier: 'Golongan IV', namaPangkat: 'Pembina Utama Muda' },
      { golongan: 'IV/b', tier: 'Golongan IV', namaPangkat: 'Pembina Tingkat I' },
      { golongan: 'IV/a', tier: 'Golongan IV', namaPangkat: 'Pembina' },
      { golongan: 'III/d', tier: 'Golongan III', namaPangkat: 'Penata Tingkat I' },
      { golongan: 'III/c', tier: 'Golongan III', namaPangkat: 'Penata' },
      { golongan: 'III/b', tier: 'Golongan III', namaPangkat: 'Penata Muda Tingkat I' },
      { golongan: 'III/a', tier: 'Golongan III', namaPangkat: 'Penata Muda' },
      { golongan: 'II/d', tier: 'Golongan II', namaPangkat: 'Pengatur Tingkat I' },
      { golongan: 'II/c', tier: 'Golongan II', namaPangkat: 'Pengatur' },
      { golongan: 'II/b', tier: 'Golongan II', namaPangkat: 'Pengatur Muda Tingkat I' },
      { golongan: 'II/a', tier: 'Golongan II', namaPangkat: 'Pengatur Muda' },
      { golongan: 'I/d', tier: 'Golongan I', namaPangkat: 'Juru Tingkat I' },
      { golongan: 'I/c', tier: 'Golongan I', namaPangkat: 'Juru' },
      { golongan: 'I/b', tier: 'Golongan I', namaPangkat: 'Juru Muda Tingkat I' },
      { golongan: 'I/a', tier: 'Golongan I', namaPangkat: 'Juru Muda' },
      { golongan: 'PPPK-X', tier: 'PPPK', namaPangkat: 'PPPK Ahli Muda (Gol X)' },
      { golongan: 'PPPK-IX', tier: 'PPPK', namaPangkat: 'PPPK Ahli Pertama (Gol IX)' },
      { golongan: 'PPPK-VII', tier: 'PPPK', namaPangkat: 'PPPK Keterampilan (Gol VII)' },
    ];

    const totalPeg = pegawaiList.length || 1;

    return listGolongan.map(item => {
      const match = pegawaiList.filter(p => p.golongan === item.golongan);
      const l = match.filter(p => p.jenisKelamin === 'L').length;
      const p = match.filter(p => p.jenisKelamin === 'P').length;
      const total = l + p;
      const persentase = ((total / totalPeg) * 100).toFixed(1);
      return {
        ...item,
        l,
        p,
        total,
        persentase,
      };
    }).filter(row => row.total > 0 || ['IV/a', 'III/a', 'II/c'].includes(row.golongan));
  }, [pegawaiList]);

  // 3. Rekapitulasi per Jabatan & Pendidikan
  const rekapJabatanPendidikan = useMemo(() => {
    const jenisJabatanList = [
      'Jabatan Pimpinan Tinggi',
      'Jabatan Administrator',
      'Jabatan Pengawas',
      'Jabatan Fungsional Keahlian',
      'Jabatan Fungsional Keterampilan',
      'Jabatan Pelaksana',
    ];

    return jenisJabatanList.map(jab => {
      const match = pegawaiList.filter(p => p.jenisJabatan === jab);
      const s3 = match.filter(p => p.jenjangPendidikan === 'Doktor (S-3)').length;
      const s2 = match.filter(p => p.jenjangPendidikan === 'Magister (S-2)').length;
      const s1 = match.filter(p => p.jenjangPendidikan === 'Sarjana (S-1) / D-4').length;
      const d3 = match.filter(p => p.jenjangPendidikan === 'Diploma III (D-3)').length;
      const slta = match.filter(p => p.jenjangPendidikan === 'SLTA / Sederajat').length;
      const total = match.length;
      return {
        jenisJabatan: jab,
        s3,
        s2,
        s1,
        d3,
        slta,
        total,
      };
    });
  }, [pegawaiList]);

  // 4. Rekapitulasi Proyeksi Pensiun BUP (Batas Usia Pensiun)
  const rekapPensiun = useMemo(() => {
    return pegawaiList
      .map(p => {
        const pen = hitungTanggalPensiun(p.tanggalLahir, p.batasUsiaPensiun);
        const age = hitungUmur(p.tanggalLahir);
        const pensionYear = new Date(pen.tanggalPensiun).getFullYear();
        return {
          pegawai: p,
          age,
          bup: p.batasUsiaPensiun,
          tanggalPensiun: pen.tanggalPensiun,
          sisaTahun: pen.sisaTahun,
          sisaBulan: pen.sisaBulan,
          pensionYear,
          isMendekati: pen.isMendekatiPensiun,
        };
      })
      .sort((a, b) => new Date(a.tanggalPensiun).getTime() - new Date(b.tanggalPensiun).getTime())
      .slice(0, 15);
  }, [pegawaiList]);

  // 5. Rekapitulasi Usulan Kenaikan Pangkat
  const rekapKP = useMemo(() => {
    return pegawaiList
      .map(p => {
        const check = cekKelayakanKP(p.tmtPangkatTerakhir);
        return {
          pegawai: p,
          ...check,
        };
      })
      .filter(item => item.isLayak)
      .sort((a, b) => b.tahunBerjalan - a.tahunBerjalan);
  }, [pegawaiList]);

  // Handle CSV Export
  const handleExportCSV = () => {
    if (activeRecapTab === 'opd') {
      const headers = ['No', 'Unit Kerja / OPD', 'PNS (L)', 'PNS (P)', 'Total PNS', 'PPPK (L)', 'PPPK (P)', 'Total PPPK', 'Total Eksisting', 'Kebutuhan ABK', 'Selisih (+/-)', 'Rata-rata Usia'];
      const rows = rekapOpd.map((r, i) => [
        i + 1,
        r.unitKerja,
        r.pnsL,
        r.pnsP,
        r.totalPns,
        r.pppkL,
        r.pppkP,
        r.totalPppk,
        r.totalEksisting,
        r.kuotaAbk,
        r.selisih,
        `${r.avgAge} Tahun`,
      ]);
      exportToCSV('Rekapitulasi_ASN_Per_Unit_Kerja', headers, rows);
    } else if (activeRecapTab === 'golongan') {
      const headers = ['No', 'Golongan / Ruang', 'Nama Pangkat', 'Laki-laki', 'Perempuan', 'Total', 'Persentase (%)'];
      const rows = rekapGolongan.map((r, i) => [
        i + 1,
        r.golongan,
        r.namaPangkat,
        r.l,
        r.p,
        r.total,
        `${r.persentase}%`,
      ]);
      exportToCSV('Rekapitulasi_ASN_Per_Golongan', headers, rows);
    } else if (activeRecapTab === 'jabatan_pendidikan') {
      const headers = ['No', 'Jenis Jabatan', 'S-3', 'S-2', 'S-1 / D-4', 'D-3', 'SLTA', 'Total ASN'];
      const rows = rekapJabatanPendidikan.map((r, i) => [
        i + 1,
        r.jenisJabatan,
        r.s3,
        r.s2,
        r.s1,
        r.d3,
        r.slta,
        r.total,
      ]);
      exportToCSV('Rekapitulasi_ASN_Jabatan_Pendidikan', headers, rows);
    } else if (activeRecapTab === 'pensiun') {
      const headers = ['No', 'NIP', 'Nama Lengkap', 'Unit Kerja', 'Jabatan', 'Usia Saat Ini', 'BUP', 'TMT Pensiun', 'Sisa Waktu'];
      const rows = rekapPensiun.map((r, i) => [
        i + 1,
        formatNip(r.pegawai.nip),
        r.pegawai.nama,
        r.pegawai.unitKerja,
        r.pegawai.jabatan,
        `${r.age} Th`,
        `${r.bup} Th`,
        formatTanggalIndo(r.tanggalPensiun),
        `${r.sisaTahun} Th ${r.sisaBulan} Bln`,
      ]);
      exportToCSV('Rekapitulasi_Proyeksi_Pensiun_BUP', headers, rows);
    } else {
      const headers = ['No', 'NIP', 'Nama Lengkap', 'Golongan', 'Jabatan', 'TMT Pangkat Terakhir', 'Lama Menjabat', 'Rekomendasi Periode KP'];
      const rows = rekapKP.map((r, i) => [
        i + 1,
        formatNip(r.pegawai.nip),
        r.pegawai.nama,
        r.pegawai.golongan,
        r.pegawai.jabatan,
        formatTanggalIndo(r.pegawai.tmtPangkatTerakhir),
        `${r.tahunBerjalan} Tahun`,
        r.periodeBerikutnya,
      ]);
      exportToCSV('Rekapitulasi_Usulan_Kenaikan_Pangkat', headers, rows);
    }
  };

  // Open official print modal
  const handlePrintClick = () => {
    let title = 'Rekapitulasi Data Kepegawaian ASN';
    let data = null;
    if (activeRecapTab === 'opd') {
      title = 'Rekapitulasi Aparatur Sipil Negara Berdasarkan Satuan Kerja & Analisis Beban Kerja';
      data = { type: 'opd', rows: rekapOpd, grandTotal: grandTotalOpd };
    } else if (activeRecapTab === 'golongan') {
      title = 'Rekapitulasi Pegawai ASN Berdasarkan Golongan & Ruang Kepangkatan';
      data = { type: 'golongan', rows: rekapGolongan };
    } else if (activeRecapTab === 'jabatan_pendidikan') {
      title = 'Rekapitulasi Pegawai Berdasarkan Jenis Jabatan & Jenjang Pendidikan Formal';
      data = { type: 'jabatan_pendidikan', rows: rekapJabatanPendidikan };
    } else if (activeRecapTab === 'pensiun') {
      title = 'Daftar Proyeksi Pegawai Mencapai Batas Usia Pensiun (BUP)';
      data = { type: 'pensiun', rows: rekapPensiun };
    } else {
      title = 'Daftar Nominatif Usulan Kenaikan Pangkat (KP) PNS';
      data = { type: 'kp', rows: rekapKP };
    }
    onOpenCetakModal(title, data);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Control Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-slate-800" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Rekapitulasi &amp; Analisis Bezetting ASN · SI-ITING
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kompilasi otomatis komparasi bezetting riil (PNS &amp; PPPK) terhadap kebutuhan formasi ABK Kabupaten Bandung Barat — <em>“Data Tepat, Keputusan Tepat”</em>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV / Excel</span>
            </button>
            <button
              onClick={handlePrintClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan Resmi</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-5 border-b border-slate-200 flex overflow-x-auto gap-4 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveRecapTab('opd')}
            className={`pb-2.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeRecapTab === 'opd'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Rekap per Satuan Kerja (OPD)</span>
          </button>
          <button
            onClick={() => setActiveRecapTab('golongan')}
            className={`pb-2.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeRecapTab === 'golongan'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rekap per Golongan & Pangkat</span>
          </button>
          <button
            onClick={() => setActiveRecapTab('kelas_jabatan')}
            className={`pb-2.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeRecapTab === 'kelas_jabatan'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Rekap per Kelas Jabatan (1-17)</span>
          </button>
          <button
            onClick={() => setActiveRecapTab('jabatan_pendidikan')}
            className={`pb-2.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeRecapTab === 'jabatan_pendidikan'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Rekap Jabatan & Pendidikan</span>
          </button>

          <button
            onClick={() => setActiveRecapTab('pensiun')}
            className={`pb-2.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeRecapTab === 'pensiun'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            <span>Proyeksi Pensiun (BUP)</span>
          </button>
          <button
            onClick={() => setActiveRecapTab('kp')}
            className={`pb-2.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeRecapTab === 'kp'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nominatif Kenaikan Pangkat (KP)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Rekap per Satuan Kerja / OPD */}
      {activeRecapTab === 'opd' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Tabel Rekapitulasi Pegawai ASN per Satuan Kerja Perangkat Daerah (SKPD/OPD)
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Otomatis terbarui sesuai data riil bezetting
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Satuan Kerja / OPD</th>
                  <th className="py-2.5 px-2 text-center" colSpan={3}>PNS</th>
                  <th className="py-2.5 px-2 text-center" colSpan={3}>PPPK</th>
                  <th className="py-2.5 px-3 text-right">Total ASN</th>
                  <th className="py-2.5 px-3 text-right">Formasi ABK</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Rata Usia</th>
                </tr>
                <tr className="bg-slate-50 text-slate-500 font-medium text-2xs border-b border-slate-200">
                  <th></th>
                  <th></th>
                  <th className="py-1 px-2 text-center font-mono">L</th>
                  <th className="py-1 px-2 text-center font-mono">P</th>
                  <th className="py-1 px-2 text-center font-mono font-bold text-slate-700">Jml</th>
                  <th className="py-1 px-2 text-center font-mono">L</th>
                  <th className="py-1 px-2 text-center font-mono">P</th>
                  <th className="py-1 px-2 text-center font-mono font-bold text-slate-700">Jml</th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rekapOpd.map((row, idx) => (
                  <tr key={row.unitKerja} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{row.unitKerja}</td>
                    <td className="py-2 px-2 text-center font-mono">{row.pnsL}</td>
                    <td className="py-2 px-2 text-center font-mono">{row.pnsP}</td>
                    <td className="py-2 px-2 text-center font-mono font-semibold text-slate-900 bg-slate-50">{row.totalPns}</td>
                    <td className="py-2 px-2 text-center font-mono">{row.pppkL}</td>
                    <td className="py-2 px-2 text-center font-mono">{row.pppkP}</td>
                    <td className="py-2 px-2 text-center font-mono font-semibold text-slate-900 bg-slate-50">{row.totalPppk}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.totalEksisting}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{row.kuotaAbk}</td>
                    <td className="py-2 px-3 text-center font-mono">
                      {row.selisih < 0 ? (
                        <span className="text-rose-600 font-medium">Kurang ({row.selisih})</span>
                      ) : row.selisih > 0 ? (
                        <span className="text-blue-600 font-medium">Lebih (+{row.selisih})</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Ideal</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{row.avgAge} Th</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-semibold border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 text-center" colSpan={2}>TOTAL KESELURUHAN</td>
                  <td className="py-2.5 px-2 text-center font-mono">{grandTotalOpd.pnsL}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{grandTotalOpd.pnsP}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold">{grandTotalOpd.totalPns}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{grandTotalOpd.pppkL}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{grandTotalOpd.pppkP}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold">{grandTotalOpd.totalPppk}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">{grandTotalOpd.totalEksisting}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{grandTotalOpd.kuotaAbk}</td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {grandTotalOpd.selisih < 0 ? `Defisit ${grandTotalOpd.selisih}` : `Surplus +${grandTotalOpd.selisih}`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Rekap per Golongan & Ruang */}
      {activeRecapTab === 'golongan' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Tabel Rekapitulasi Pegawai ASN Berdasarkan Golongan & Ruang
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total: {pegawaiList.length} Aparatur
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Golongan / Ruang</th>
                  <th className="py-2.5 px-3">Nama Pangkat Resmi</th>
                  <th className="py-2.5 px-3 text-center font-mono">Laki-laki (L)</th>
                  <th className="py-2.5 px-3 text-center font-mono">Perempuan (P)</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold">Total Pegawai</th>
                  <th className="py-2.5 px-3 text-right font-mono">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rekapGolongan.map((row, idx) => (
                  <tr key={row.golongan} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-mono">{row.golongan}</td>
                    <td className="py-2 px-3 text-slate-700">{row.namaPangkat}</td>
                    <td className="py-2 px-3 text-center font-mono">{row.l}</td>
                    <td className="py-2 px-3 text-center font-mono">{row.p}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.total}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{row.persentase}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-semibold border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 text-center" colSpan={3}>TOTAL KESELURUHAN</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapGolongan.reduce((a, b) => a + b.l, 0)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapGolongan.reduce((a, b) => a + b.p, 0)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold">{rekapGolongan.reduce((a, b) => a + b.total, 0)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2b: Rekap per Kelas Jabatan (1 s/d 17) */}
      {activeRecapTab === 'kelas_jabatan' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Tabel Rekapitulasi Pegawai ASN Berdasarkan Kelas Jabatan (1 - 17)
              </h2>
              <p className="text-2xs text-slate-500 mt-0.5">
                Struktur jenjang kelas jabatan sebagai basis remunerasi dan penjenjangan karir ASN
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total: {pegawaiList.length} Aparatur
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">Kelas</th>
                  <th className="py-2.5 px-3">Tingkatan / Penyetaraan Jabatan</th>
                  <th className="py-2.5 px-3 text-center font-mono">PNS</th>
                  <th className="py-2.5 px-3 text-center font-mono">PPPK</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold">Total Pegawai</th>
                  <th className="py-2.5 px-3 text-right font-mono">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rekapKelasJabatan.map((row) => (
                  <tr key={row.kelas} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2 px-3 text-center font-mono font-bold text-amber-900 bg-amber-50/50">
                      Kelas {row.kelas}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">{row.keterangan}</td>
                    <td className="py-2 px-3 text-center font-mono">{row.pns}</td>
                    <td className="py-2 px-3 text-center font-mono">{row.pppk}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.total}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{row.persentase}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-semibold border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 text-center" colSpan={2}>TOTAL KESELURUHAN</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapKelasJabatan.reduce((a, b) => a + b.pns, 0)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapKelasJabatan.reduce((a, b) => a + b.pppk, 0)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold">{rekapKelasJabatan.reduce((a, b) => a + b.total, 0)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}


      {/* Tab 3: Rekap Jabatan & Pendidikan */}
      {activeRecapTab === 'jabatan_pendidikan' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Matriks Rekapitulasi Silang: Jenis Jabatan ASN vs Jenjang Kualifikasi Pendidikan
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Jenis Jabatan ASN</th>
                  <th className="py-2.5 px-3 text-center font-mono">Doktor (S-3)</th>
                  <th className="py-2.5 px-3 text-center font-mono">Magister (S-2)</th>
                  <th className="py-2.5 px-3 text-center font-mono">Sarjana (S-1/D-4)</th>
                  <th className="py-2.5 px-3 text-center font-mono">Diploma III (D-3)</th>
                  <th className="py-2.5 px-3 text-center font-mono">SLTA / Sdrjt</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold">Total Jabatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rekapJabatanPendidikan.map((row, idx) => (
                  <tr key={row.jenisJabatan} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.jenisJabatan}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.s3}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.s2}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.s1}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.d3}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.slta}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-semibold border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 text-center" colSpan={2}>TOTAL KESELURUHAN</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapJabatanPendidikan.reduce((a, b) => a + b.s3, 0)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapJabatanPendidikan.reduce((a, b) => a + b.s2, 0)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapJabatanPendidikan.reduce((a, b) => a + b.s1, 0)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapJabatanPendidikan.reduce((a, b) => a + b.d3, 0)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{rekapJabatanPendidikan.reduce((a, b) => a + b.slta, 0)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold">{rekapJabatanPendidikan.reduce((a, b) => a + b.total, 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Rekap Proyeksi Pensiun (BUP) */}
      {activeRecapTab === 'pensiun' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Daftar Pegawai Mendekati Batas Usia Pensiun (BUP)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Peringatan dini perencanaan formasi pengganti, seleksi terbuka JPT, dan mutasi suksesi.
              </p>
            </div>
            <span className="text-xs text-rose-600 font-medium">
              Prioritas Suksesi Kepegawaian
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Pegawai / NIP</th>
                  <th className="py-2.5 px-3">Satuan Kerja & Jabatan</th>
                  <th className="py-2.5 px-3 font-mono">Golongan</th>
                  <th className="py-2.5 px-3 font-mono text-center">Usia</th>
                  <th className="py-2.5 px-3 font-mono text-center">BUP</th>
                  <th className="py-2.5 px-3 font-mono">TMT Pensiun</th>
                  <th className="py-2.5 px-3 font-mono">Sisa Masa Kerja</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rekapPensiun.map((row, idx) => (
                  <tr key={row.pegawai.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-slate-900">{row.pegawai.nama}</p>
                      <p className="font-mono text-2xs text-slate-500">{formatNip(row.pegawai.nip)}</p>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-medium text-slate-800">{row.pegawai.jabatan}</p>
                      <p className="text-2xs text-slate-500">{row.pegawai.unitKerja}</p>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-700">{row.pegawai.golongan}</td>
                    <td className="py-2 px-3 text-center font-mono">{row.age} Th</td>
                    <td className="py-2 px-3 text-center font-mono">{row.bup} Th</td>
                    <td className="py-2 px-3 font-mono text-rose-700 font-medium">
                      {formatTanggalIndo(row.tanggalPensiun)}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {row.isMendekati ? (
                        <span className="text-rose-600 font-bold">
                          {row.sisaTahun} Th {row.sisaBulan} Bln (Kritis)
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          {row.sisaTahun} Th {row.sisaBulan} Bln
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onSelectPegawai(row.pegawai)}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Rekap Nominatif KP */}
      {activeRecapTab === 'kp' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Daftar Nominatif PNS Memenuhi Syarat Kenaikan Pangkat (KP)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kriteria reguler $\ge 4$ tahun pada pangkat terakhir dengan predikat kinerja minimal Baik.
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-mono font-medium">
              {rekapKP.length} Calon Usulan KP
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Pegawai & NIP</th>
                  <th className="py-2.5 px-3">Satuan Kerja & Jabatan</th>
                  <th className="py-2.5 px-3 font-mono">Golongan Riil</th>
                  <th className="py-2.5 px-3 font-mono">TMT Pangkat Terakhir</th>
                  <th className="py-2.5 px-3 font-mono">Masa Kerja Golongan</th>
                  <th className="py-2.5 px-3">Predikat Kinerja</th>
                  <th className="py-2.5 px-3">Periode KP yang Disarankan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rekapKP.map((row, idx) => (
                  <tr key={row.pegawai.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <p className="font-semibold text-slate-900">{row.pegawai.nama}</p>
                      <p className="font-mono text-2xs text-slate-500">{formatNip(row.pegawai.nip)}</p>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-medium text-slate-800">{row.pegawai.jabatan}</p>
                      <p className="text-2xs text-slate-500">{row.pegawai.unitKerja}</p>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-700">{row.pegawai.golongan}</td>
                    <td className="py-2 px-3 font-mono">{formatTanggalIndo(row.pegawai.tmtPangkatTerakhir)}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-800">{row.tahunBerjalan} Tahun</td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-emerald-700">{row.pegawai.predikatKinerja}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-900 font-medium">
                      {row.periodeBerikutnya}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
