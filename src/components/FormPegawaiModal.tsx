import React, { useState, useEffect } from 'react';
import { Pegawai, GolonganRuang, JenisPegawai, KategoriJabatan, JenisJabatan, Eselon, JenjangPendidikan, StatusKepegawaian } from '../types/asn';
import { PANGKAT_MAP, UNIT_KERJA_LIST, parseNip, formatNip, estimasiKelasJabatan, hitungUmur } from '../utils/asnHelpers';
import { X, Check } from 'lucide-react';

interface FormPegawaiModalProps {
  pegawai: Pegawai | null; // null if adding new
  isOpen: boolean;
  onClose: () => void;
  onSave: (pegawai: Pegawai) => void;
}

export const FormPegawaiModal: React.FC<FormPegawaiModalProps> = ({
  pegawai,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  // Form State
  const [nip, setNip] = useState(pegawai?.nip || '');
  const [nama, setNama] = useState(pegawai?.nama || '');
  const [gelarDepan, setGelarDepan] = useState(pegawai?.gelarDepan || '');
  const [gelarBelakang, setGelarBelakang] = useState(pegawai?.gelarBelakang || '');
  const [jenisPegawai, setJenisPegawai] = useState<JenisPegawai>(pegawai?.jenisPegawai || 'PNS');
  const [golongan, setGolongan] = useState<GolonganRuang>(pegawai?.golongan || 'III/a');
  const [pangkat, setPangkat] = useState(pegawai?.pangkat || PANGKAT_MAP['III/a']);
  const [jabatan, setJabatan] = useState(pegawai?.jabatan || '');
  const [kelasJabatan, setKelasJabatan] = useState<number>(pegawai?.kelasJabatan || 8);
  const [kategoriJabatan, setKategoriJabatan] = useState<KategoriJabatan>(pegawai?.kategoriJabatan || 'Fungsional');
  const [jenisJabatan, setJenisJabatan] = useState<JenisJabatan>(pegawai?.jenisJabatan || 'Jabatan Fungsional Keahlian');
  const [eselon, setEselon] = useState<Eselon>(pegawai?.eselon || 'Non-Eselon');
  const [unitKerja, setUnitKerja] = useState(pegawai?.unitKerja || UNIT_KERJA_LIST[0]);
  const [subUnitKerja, setSubUnitKerja] = useState(pegawai?.subUnitKerja || '');
  const [jenjangPendidikan, setJenjangPendidikan] = useState<JenjangPendidikan>(pegawai?.jenjangPendidikan || 'Sarjana (S-1) / D-4');
  const [jurusanPendidikan, setJurusanPendidikan] = useState(pegawai?.jurusanPendidikan || '');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>(pegawai?.jenisKelamin || 'L');
  const [tempatLahir, setTempatLahir] = useState(pegawai?.tempatLahir || '');
  const [tanggalLahir, setTanggalLahir] = useState(pegawai?.tanggalLahir || '1990-01-01');
  const [tmtCpns, setTmtCpns] = useState(pegawai?.tmtCpns || '2015-01-01');
  const [tmtPangkatTerakhir, setTmtPangkatTerakhir] = useState(pegawai?.tmtPangkatTerakhir || '2023-04-01');
  const [tmtJabatanTerakhir, setTmtJabatanTerakhir] = useState(pegawai?.tmtJabatanTerakhir || '2023-05-01');
  const [masaKerjaTahun, setMasaKerjaTahun] = useState<number>(pegawai?.masaKerjaTahun || 5);
  const [masaKerjaBulan, setMasaKerjaBulan] = useState<number>(pegawai?.masaKerjaBulan || 0);
  const [statusKepegawaian, setStatusKepegawaian] = useState<StatusKepegawaian>(pegawai?.statusKepegawaian || 'Aktif');
  const [email, setEmail] = useState(pegawai?.email || '');
  const [noHp, setNoHp] = useState(pegawai?.noHp || '');
  const [predikatKinerja, setPredikatKinerja] = useState<'Sangat Baik' | 'Baik' | 'Butuh Perbaikan'>(pegawai?.predikatKinerja || 'Baik');
  const [batasUsiaPensiun, setBatasUsiaPensiun] = useState<number>(pegawai?.batasUsiaPensiun || 58);
  const [diklatTerakhir, setDiklatTerakhir] = useState(pegawai?.diklatTerakhir || '');

  const [nipNotice, setNipNotice] = useState<string | null>(null);

  // When NIP is typed, auto-extract details
  const handleNipChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 18);
    setNip(raw);

    if (raw.length === 18) {
      const parsed = parseNip(raw);
      if (parsed.isValid && parsed.tanggalLahir && parsed.jenisKelamin && parsed.tmtCpns) {
        setTanggalLahir(parsed.tanggalLahir);
        setJenisKelamin(parsed.jenisKelamin);
        setTmtCpns(parsed.tmtCpns);
        setNipNotice('Data tanggal lahir, jenis kelamin, dan TMT CPNS berhasil diekstrak otomatis dari NIP.');
      } else {
        setNipNotice(null);
      }
    } else {
      setNipNotice(null);
    }
  };

  // Update Pangkat & estimate Kelas Jabatan automatically when Golongan changes
  const handleGolonganChange = (g: GolonganRuang) => {
    setGolongan(g);
    setPangkat(PANGKAT_MAP[g] || '');
    if (g.startsWith('PPPK')) {
      setJenisPegawai('PPPK');
    } else {
      setJenisPegawai('PNS');
    }
    if (!pegawai) {
      setKelasJabatan(estimasiKelasJabatan(kategoriJabatan, eselon, g));
    }
  };

  // Update Kelas Jabatan when Kategori Jabatan changes
  const handleKategoriJabatanChange = (kat: KategoriJabatan) => {
    setKategoriJabatan(kat);
    if (kat === 'Struktural') {
      if (eselon === 'Non-Eselon') setEselon('III.b');
      setJenisJabatan('Jabatan Administrator');
    } else if (kat === 'Fungsional') {
      setEselon('Non-Eselon');
      setJenisJabatan('Jabatan Fungsional Keahlian');
    } else {
      setEselon('Non-Eselon');
      setJenisJabatan('Jabatan Pelaksana');
    }
    if (!pegawai) {
      setKelasJabatan(estimasiKelasJabatan(kat, eselon, golongan));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nip || nip.length !== 18) {
      alert('NIP wajib terdiri dari 18 digit angka sesuai format BKN.');
      return;
    }
    if (!nama.trim()) {
      alert('Nama pegawai wajib diisi.');
      return;
    }

    const updated: Pegawai = {
      id: pegawai ? pegawai.id : `peg-${Date.now()}`,
      nip,
      nama,
      gelarDepan: gelarDepan.trim() || undefined,
      gelarBelakang: gelarBelakang.trim() || undefined,
      jenisPegawai,
      golongan,
      pangkat,
      jabatan,
      kelasJabatan: Number(kelasJabatan) || 7,
      kategoriJabatan,
      jenisJabatan,
      eselon,
      unitKerja,
      subUnitKerja,
      jenjangPendidikan,
      jurusanPendidikan,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      tmtCpns,
      tmtPangkatTerakhir,
      tmtJabatanTerakhir,
      masaKerjaTahun,
      masaKerjaBulan,
      statusKepegawaian,
      email: email || `${nama.toLowerCase().replace(/[^a-z]/g, '')}@pemda.go.id`,
      noHp: noHp || '08123456789',
      predikatKinerja,
      diklatTerakhir: diklatTerakhir || undefined,
      batasUsiaPensiun,
      riwayatMutasi: pegawai ? pegawai.riwayatMutasi : [],
      riwayatPangkat: pegawai ? pegawai.riwayatPangkat : [],
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {pegawai ? 'Ubah Data Pegawai ASN' : 'Pendaftaran Pegawai ASN Baru'}
            </h2>
            <p className="text-2xs text-slate-400 mt-0.5">
              Kelola data master ASN, rincian kelas jabatan (1-17), jenis jabatan, dan unit penempatan
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
            {/* Section 1: Identitas & NIP */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                1. Identitas Pokok Pegawai & NIP
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    NIP (18 Digit Angka Standard BKN) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => handleNipChange(e.target.value)}
                    placeholder="Contoh: 198504122010011004"
                    maxLength={18}
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {nip.length > 0 && (
                    <span className="block text-3xs text-slate-500 font-mono mt-0.5">
                      Preview: {formatNip(nip)} ({nip.length}/18 digit)
                    </span>
                  )}
                  {nipNotice && (
                    <p className="text-3xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      <span>{nipNotice}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jenis Pegawai</label>
                  <select
                    value={jenisPegawai}
                    onChange={(e) => setJenisPegawai(e.target.value as JenisPegawai)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pegawai Pemerintah Perjanjian Kerja)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Gelar Depan</label>
                  <input
                    type="text"
                    value={gelarDepan}
                    onChange={(e) => setGelarDepan(e.target.value)}
                    placeholder="Contoh: Dr. Drs."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Nama Lengkap (Tanpa Gelar) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Bambang Triatmojo"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Gelar Belakang</label>
                  <input
                    type="text"
                    value={gelarBelakang}
                    onChange={(e) => setGelarBelakang(e.target.value)}
                    placeholder="Contoh: M.Si."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-medium">Tanggal Lahir</label>
                    {tanggalLahir && (
                      <span className="text-3xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Usia: {hitungUmur(tanggalLahir)} Tahun
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Jabatan, Kelas Jabatan & Unit Kerja */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                2. Rincian Jabatan, Kelas Jabatan & Unit Kerja
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jenis Jabatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kategoriJabatan}
                    onChange={(e) => handleKategoriJabatanChange(e.target.value as KategoriJabatan)}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Struktural">Struktural</option>
                    <option value="Fungsional">Fungsional</option>
                    <option value="Pelaksana">Pelaksana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kelas Jabatan (1 - 17) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kelasJabatan}
                    onChange={(e) => setKelasJabatan(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {Array.from({ length: 17 }, (_, i) => 17 - i).map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Eselon</label>
                  <select
                    value={eselon}
                    onChange={(e) => setEselon(e.target.value as Eselon)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="II.a">II.a (JPT Madya / Kepala Badan Utama)</option>
                    <option value="II.b">II.b (JPT Pratama / Kepala Dinas)</option>
                    <option value="III.a">III.a (Administrator / Sekretaris / Kabid Utama)</option>
                    <option value="III.b">III.b (Administrator / Kepala Bidang)</option>
                    <option value="IV.a">IV.a (Pengawas / Kasubag / Kasi)</option>
                    <option value="IV.b">IV.b (Pengawas)</option>
                    <option value="Non-Eselon">Non-Eselon (Fungsional / Pelaksana)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Lengkap Jabatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Kepala Bidang Perencanaan Makro / Pranata Komputer Ahli Muda"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Satuan Kerja / Unit Kerja (OPD) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    {UNIT_KERJA_LIST.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Sub Unit Kerja / Bidang / Bagian</label>
                  <input
                    type="text"
                    value={subUnitKerja}
                    onChange={(e) => setSubUnitKerja(e.target.value)}
                    placeholder="Contoh: Bidang Pembinaan SMP"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Golongan / Ruang</label>
                  <select
                    value={golongan}
                    onChange={(e) => handleGolonganChange(e.target.value as GolonganRuang)}
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {Object.keys(PANGKAT_MAP).map(g => (
                      <option key={g} value={g}>{g} - {PANGKAT_MAP[g as GolonganRuang]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nama Pangkat Resmi</label>
                  <input
                    type="text"
                    value={pangkat}
                    onChange={(e) => setPangkat(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Masa Kerja, Pendidikan & Status */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                3. Masa Kerja, Pendidikan & Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jenjang Pendidikan</label>
                  <select
                    value={jenjangPendidikan}
                    onChange={(e) => setJenjangPendidikan(e.target.value as JenjangPendidikan)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Doktor (S-3)">Doktor (S-3)</option>
                    <option value="Magister (S-2)">Magister (S-2)</option>
                    <option value="Sarjana (S-1) / D-4">Sarjana (S-1) / D-4</option>
                    <option value="Diploma III (D-3)">Diploma III (D-3)</option>
                    <option value="SLTA / Sederajat">SLTA / Sederajat</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Jurusan / Program Studi</label>
                  <input
                    type="text"
                    value={jurusanPendidikan}
                    onChange={(e) => setJurusanPendidikan(e.target.value)}
                    placeholder="Contoh: Administrasi Publik / Teknik Informatika"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Masa Kerja (Th)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={masaKerjaTahun}
                    onChange={(e) => setMasaKerjaTahun(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">BUP Pensiun (Th)</label>
                  <select
                    value={batasUsiaPensiun}
                    onChange={(e) => setBatasUsiaPensiun(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value={58}>58 Tahun (Pelaksana / Pengawas)</option>
                    <option value={60}>60 Tahun (Administrator / JPT / Madya)</option>
                    <option value={65}>65 Tahun (Fungsional Ahli Utama)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Kepegawaian</label>
                  <select
                    value={statusKepegawaian}
                    onChange={(e) => setStatusKepegawaian(e.target.value as StatusKepegawaian)}
                    className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pensiun">Pensiun</option>
                    <option value="Mutasi">Mutasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Predikat Kinerja</label>
                  <select
                    value={predikatKinerja}
                    onChange={(e) => setPredikatKinerja(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Butuh Perbaikan">Butuh Perbaikan</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
            >
              {pegawai ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
