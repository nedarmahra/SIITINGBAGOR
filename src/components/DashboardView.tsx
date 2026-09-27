import React, { useState, useMemo } from 'react';
import { Pegawai } from '../types/asn';
import { FORMASI_ABK_MAP, hitungTanggalPensiun, cekKelayakanKP, hitungUmur } from '../utils/asnHelpers';
import { 
  Users, 
  CalendarClock, 
  Award, 
  Building2, 
  Briefcase,
  Layers,
  GraduationCap, 
  CheckCircle2, 
  Filter
} from 'lucide-react';

interface DashboardViewProps {
  pegawaiList: Pegawai[];
  onSelectPegawai: (pegawai: Pegawai) => void;
  onNavigateToTab: (tab: 'rekapitulasi' | 'pegawai') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pegawaiList,
  onSelectPegawai,
  onNavigateToTab,
}) => {
  const [activeDistributionTab, setActiveDistributionTab] = useState<'kategori' | 'kelas' | 'golongan' | 'status' | 'gender' | 'pendidikan'>('kategori');
  const [selectedOpdFilter, setSelectedOpdFilter] = useState<string>('all');

  // Filter pegawai by OPD if specified
  const filteredPegawai = useMemo(() => {
    if (selectedOpdFilter === 'all') return pegawaiList;
    return pegawaiList.filter(p => p.unitKerja === selectedOpdFilter);
  }, [pegawaiList, selectedOpdFilter]);

  // Aggregate Key Metrics
  const totalASN = filteredPegawai.length;
  const countPNS = filteredPegawai.filter(p => p.jenisPegawai === 'PNS').length;
  const countPPPK = filteredPegawai.filter(p => p.jenisPegawai === 'PPPK').length;

  const countStruktural = filteredPegawai.filter(p => p.kategoriJabatan === 'Struktural').length;
  const countFungsional = filteredPegawai.filter(p => p.kategoriJabatan === 'Fungsional').length;
  const countPelaksana = filteredPegawai.filter(p => p.kategoriJabatan === 'Pelaksana').length;

  const countAktif = filteredPegawai.filter(p => p.statusKepegawaian === 'Aktif').length;
  const countPensiun = filteredPegawai.filter(p => p.statusKepegawaian === 'Pensiun').length;
  const countMutasi = filteredPegawai.filter(p => p.statusKepegawaian === 'Mutasi').length;

  const countMendekatiPensiun = filteredPegawai.filter(p => {
    const pen = hitungTanggalPensiun(p.tanggalLahir, p.batasUsiaPensiun);
    return pen.isMendekatiPensiun;
  }).length;

  const countLayakKP = filteredPegawai.filter(p => {
    return cekKelayakanKP(p.tmtPangkatTerakhir).isLayak;
  }).length;

  // Breakdown by Kelas Jabatan
  const kelasJabatanStats = useMemo(() => {
    const map: Record<number, number> = {};
    for (let i = 1; i <= 17; i++) map[i] = 0;

    filteredPegawai.forEach(p => {
      if (p.kelasJabatan >= 1 && p.kelasJabatan <= 17) {
        map[p.kelasJabatan] = (map[p.kelasJabatan] || 0) + 1;
      }
    });

    return Object.entries(map)
      .map(([k, count]) => ({ kelas: Number(k), count }))
      .filter(item => item.count > 0 || [7, 8, 9, 11, 12, 14, 15].includes(item.kelas))
      .sort((a, b) => b.kelas - a.kelas);
  }, [filteredPegawai]);

  // Distribution by Golongan Tier
  const golonganStats = useMemo(() => {
    const tiers: Record<string, { label: string; count: number }> = {
      'Golongan IV': { label: 'Golongan IV (Pembina)', count: 0 },
      'Golongan III': { label: 'Golongan III (Penata)', count: 0 },
      'Golongan II': { label: 'Golongan II (Pengatur)', count: 0 },
      'Golongan I': { label: 'Golongan I (Juru)', count: 0 },
      'PPPK': { label: 'PPPK (Semua Golongan)', count: 0 },
    };

    filteredPegawai.forEach(p => {
      if (p.jenisPegawai === 'PPPK') {
        tiers['PPPK'].count++;
      } else if (p.golongan.startsWith('IV')) {
        tiers['Golongan IV'].count++;
      } else if (p.golongan.startsWith('III')) {
        tiers['Golongan III'].count++;
      } else if (p.golongan.startsWith('II')) {
        tiers['Golongan II'].count++;
      } else {
        tiers['Golongan I'].count++;
      }
    });

    return Object.values(tiers);
  }, [filteredPegawai]);

  // Generation demographics
  const generasiStats = useMemo(() => {
    let genZ = 0; // < 28 (lahir >= 1997)
    let millennial = 0; // 28 - 43 (lahir 1981 - 1996)
    let genX = 0; // 44 - 59 (lahir 1965 - 1980)
    let boomer = 0; // >= 60 (lahir <= 1964)

    filteredPegawai.forEach(p => {
      const age = hitungUmur(p.tanggalLahir);
      if (age < 28) genZ++;
      else if (age <= 43) millennial++;
      else if (age <= 59) genX++;
      else boomer++;
    });

    return [
      { label: 'Generasi Z (< 28 th)', count: genZ, color: '#38bdf8' },
      { label: 'Milenial (28 - 43 th)', count: millennial, color: '#3b82f6' },
      { label: 'Generasi X (44 - 59 th)', count: genX, color: '#6366f1' },
      { label: 'Baby Boomer (60+ th)', count: boomer, color: '#f59e0b' },
    ];
  }, [filteredPegawai]);

  // Education breakdown
  const pendidikanStats = useMemo(() => {
    const map: Record<string, number> = {
      'Doktor (S-3)': 0,
      'Magister (S-2)': 0,
      'Sarjana (S-1) / D-4': 0,
      'Diploma III (D-3)': 0,
      'SLTA / Sederajat': 0,
    };
    filteredPegawai.forEach(p => {
      if (map[p.jenjangPendidikan] !== undefined) {
        map[p.jenjangPendidikan]++;
      } else {
        map['Sarjana (S-1) / D-4']++;
      }
    });
    return Object.entries(map).map(([label, count]) => ({ label, count }));
  }, [filteredPegawai]);

  // Status Kepegawaian breakdown (Aktif, Pensiun, Mutasi)
  const statusStats = useMemo(() => {
    const total = filteredPegawai.length || 1;
    return [
      {
        label: 'Pegawai Aktif',
        status: 'Aktif',
        count: countAktif,
        persen: Math.round((countAktif / total) * 100),
        color: '#10b981',
        desc: 'Aparatur yang saat ini aktif berdinas dan menjalankan tugas jabatan.',
      },
      {
        label: 'Pegawai Pensiun',
        status: 'Pensiun',
        count: countPensiun,
        persen: Math.round((countPensiun / total) * 100),
        color: '#64748b',
        desc: 'Aparatur yang telah mencapai batas usia pensiun (BUP) atau purna tugas.',
      },
      {
        label: 'Pegawai Mutasi',
        status: 'Mutasi',
        count: countMutasi,
        persen: Math.round((countMutasi / total) * 100),
        color: '#f59e0b',
        desc: 'Aparatur berstatus mutasi internal/eksternal antar satuan kerja.',
      },
    ];
  }, [filteredPegawai, countAktif, countPensiun, countMutasi]);

  // Satuan Kerja summary
  const opdSummaryList = useMemo(() => {
    const list = Object.keys(FORMASI_ABK_MAP).map(opd => {
      const staff = pegawaiList.filter(p => p.unitKerja === opd);
      return {
        unitKerja: opd,
        total: staff.length,
        pns: staff.filter(p => p.jenisPegawai === 'PNS').length,
        pppk: staff.filter(p => p.jenisPegawai === 'PPPK').length,
      };
    });
    return list.sort((a, b) => b.total - a.total);
  }, [pegawaiList]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter and Context Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              SI-ITING (SISTEM INFORMASI BEZETTING)
            </h1>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 italic">
                Data Tepat, Keputusan Tepat!
              </span>
            </div>
            <p className="text-3xs sm:text-2xs font-bold text-slate-500 tracking-wider uppercase mt-1">
              BAGIAN ORGANISASI KAB. BANDUNG BARAT
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedOpdFilter}
                onChange={(e) => setSelectedOpdFilter(e.target.value)}
                className="text-xs sm:text-sm bg-slate-50 border border-slate-300 text-slate-800 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              >
                <option value="all">Semua Satuan Kerja / OPD</option>
                {Object.keys(FORMASI_ABK_MAP).map(opd => (
                  <option key={opd} value={opd}>{opd}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => onNavigateToTab('rekapitulasi')}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
            >
              Cetak Rekapitulasi Bezetting
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Pegawai */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total ASN Terdata</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {totalASN}
            </span>
            <span className="text-xs text-slate-500 font-mono">Orang</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>PNS: <strong className="font-mono text-slate-700">{countPNS}</strong></span>
            <span className="mx-1">·</span>
            <span>PPPK: <strong className="font-mono text-slate-700">{countPPPK}</strong></span>
          </div>
        </div>

        {/* Jabatan Struktural */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Jabatan Struktural</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700 font-mono tabular-nums">
              {countStruktural}
            </span>
            <span className="text-xs text-slate-500">Pegawai</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>JPT, Admin, Pengawas</span>
          </div>
        </div>

        {/* Jabatan Fungsional */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Jabatan Fungsional</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
              {countFungsional}
            </span>
            <span className="text-xs text-slate-500">Pegawai</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Keahlian & Keterampilan</span>
          </div>
        </div>

        {/* Jabatan Pelaksana */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Jabatan Pelaksana</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-800 font-mono tabular-nums">
              {countPelaksana}
            </span>
            <span className="text-xs text-slate-500">Pegawai</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Staf Operasional</span>
          </div>
        </div>

        {/* Mendekati Pensiun (BUP) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">BUP $\le 1$ Tahun</span>
            <CalendarClock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600 font-mono tabular-nums">
              {countMendekatiPensiun}
            </span>
            <span className="text-xs text-slate-500">Pegawai</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Perlu suksesi pengganti</span>
          </div>
        </div>

        {/* Usulan Kenaikan Pangkat (KP) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Usulan KP Layak</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 font-mono tabular-nums">
              {countLayakKP}
            </span>
            <span className="text-xs text-slate-500">Pegawai</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Masa kerja &ge; 4 tahun</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Distribution Matrix (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Visualisasi Distribusi Struktur Personel ASN
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih dimensi visualisasi untuk menganalisis komposisi aparatur.
              </p>
            </div>

            {/* Dimension Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
              <button
                onClick={() => setActiveDistributionTab('kategori')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeDistributionTab === 'kategori' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jenis Jabatan
              </button>
              <button
                onClick={() => setActiveDistributionTab('kelas')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeDistributionTab === 'kelas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas Jabatan
              </button>
              <button
                onClick={() => setActiveDistributionTab('golongan')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeDistributionTab === 'golongan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Golongan
              </button>
              <button
                onClick={() => setActiveDistributionTab('status')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeDistributionTab === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Status ASN
              </button>
              <button
                onClick={() => setActiveDistributionTab('gender')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeDistributionTab === 'gender' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Generasi
              </button>
              <button
                onClick={() => setActiveDistributionTab('pendidikan')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeDistributionTab === 'pendidikan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendidikan
              </button>
            </div>
          </div>

          <div className="mt-6">
            {/* View 1: Jenis Jabatan (Struktural, Fungsional, Pelaksana) */}
            {activeDistributionTab === 'kategori' && (
              <div className="space-y-4">
                {[
                  { label: 'Jabatan Struktural (Pimpinan Tinggi, Administrator, Pengawas)', count: countStruktural, color: '#3b82f6', desc: 'Pemegang komando manajerial unit kerja' },
                  { label: 'Jabatan Fungsional (Keahlian & Keterampilan Teknis)', count: countFungsional, color: '#10b981', desc: 'Tenaga profesional fungsional keahlian' },
                  { label: 'Jabatan Pelaksana (Fungsional Umum / Staf Administrasi)', count: countPelaksana, color: '#64748b', desc: 'Dukungan operasional dan ketatausahaan' },
                ].map((item, idx) => {
                  const pct = totalASN > 0 ? Math.round((item.count / totalASN) * 100) : 0;
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{item.label}</p>
                          <p className="text-3xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <span className="font-mono text-sm font-bold text-slate-900">{item.count}</span>
                          <span className="text-xs text-slate-400 font-mono">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 2: Kelas Jabatan (1 - 17) */}
            {activeDistributionTab === 'kelas' && (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {kelasJabatanStats.map((item) => {
                  const pct = totalASN > 0 ? Math.round((item.count / totalASN) * 100) : 0;
                  return (
                    <div key={item.kelas} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 font-mono">
                          Kelas Jabatan {item.kelas}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900">{item.count} ASN</span>
                          <span className="text-slate-400 text-2xs">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 3: Golongan */}
            {activeDistributionTab === 'golongan' && (
              <div className="space-y-3">
                {golonganStats.map((item, idx) => {
                  const pct = totalASN > 0 ? Math.round((item.count / totalASN) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900">{item.count}</span>
                          <span className="text-slate-400 text-2xs">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-800 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 3b: Status Kepegawaian (Aktif, Pensiun, Mutasi) */}
            {activeDistributionTab === 'status' && (
              <div className="space-y-3">
                {statusStats.map((item) => (
                  <div key={item.status} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="font-semibold text-slate-900">{item.label}</p>
                        </div>
                        <p className="text-3xs text-slate-500 mt-0.5 ml-4.5">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-mono text-sm font-bold text-slate-900">{item.count}</span>
                        <span className="text-xs text-slate-400 font-mono">({item.persen}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.persen}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 4: Generasi */}
            {activeDistributionTab === 'gender' && (
              <div className="space-y-3">
                {generasiStats.map((item, idx) => {
                  const pct = totalASN > 0 ? Math.round((item.count / totalASN) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900">{item.count}</span>
                          <span className="text-slate-400 text-2xs">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 5: Pendidikan */}
            {activeDistributionTab === 'pendidikan' && (
              <div className="space-y-3">
                {pendidikanStats.map((item, idx) => {
                  const pct = totalASN > 0 ? Math.round((item.count / totalASN) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900">{item.count}</span>
                          <span className="text-slate-400 text-2xs">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Satuan Kerja Distribution List */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Penyebaran per Satuan Kerja
              </h2>
              <button
                onClick={() => onNavigateToTab('rekapitulasi')}
                className="text-2xs text-blue-600 hover:underline font-medium"
              >
                Lihat Rekap &rarr;
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {opdSummaryList.map((opd) => (
                <div key={opd.unitKerja} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <span className="text-slate-800 font-medium leading-snug break-words flex-1">{opd.unitKerja}</span>
                  <div className="flex items-center gap-1.5 font-mono shrink-0 pt-0.5">
                    <span className="font-bold text-slate-900">{opd.total}</span>
                    <span className="text-2xs text-slate-400">({opd.pns} PNS/{opd.pppk} PPPK)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Rasio Gender L:P</span>
            <span className="font-mono font-semibold text-slate-800">
              {filteredPegawai.filter(p => p.jenisKelamin === 'L').length} Laki-laki / {filteredPegawai.filter(p => p.jenisKelamin === 'P').length} Perempuan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
