export type JenisPegawai = 'PNS' | 'PPPK';

export type GolonganRuang =
  | 'I/a' | 'I/b' | 'I/c' | 'I/d'
  | 'II/a' | 'II/b' | 'II/c' | 'II/d'
  | 'III/a' | 'III/b' | 'III/c' | 'III/d'
  | 'IV/a' | 'IV/b' | 'IV/c' | 'IV/d' | 'IV/e'
  | 'PPPK-VII' | 'PPPK-IX' | 'PPPK-X';

export type KategoriJabatan = 'Struktural' | 'Fungsional' | 'Pelaksana';

export type JenisJabatan =
  | 'Jabatan Pimpinan Tinggi'
  | 'Jabatan Administrator'
  | 'Jabatan Pengawas'
  | 'Jabatan Fungsional Keahlian'
  | 'Jabatan Fungsional Keterampilan'
  | 'Jabatan Pelaksana';

export type Eselon =
  | 'II.a'
  | 'II.b'
  | 'III.a'
  | 'III.b'
  | 'IV.a'
  | 'IV.b'
  | 'Non-Eselon';

export type JenjangPendidikan =
  | 'SLTA / Sederajat'
  | 'Diploma III (D-3)'
  | 'Sarjana (S-1) / D-4'
  | 'Magister (S-2)'
  | 'Doktor (S-3)';

export type StatusKepegawaian =
  | 'Aktif'
  | 'Pensiun'
  | 'Mutasi';


export type JenisMutasi =
  | 'Rotasi Antar OPD'
  | 'Mutasi Internal'
  | 'Promosi Jabatan'
  | 'Mutasi Masuk Instansi'
  | 'Mutasi Keluar Instansi';

export interface RiwayatMutasi {
  id: string;
  nomorSK: string;
  tanggalSK: string;
  tanggalEfektif: string; // TMT Mutasi
  jenisMutasi: JenisMutasi;
  dariUnitKerja: string;
  keUnitKerja: string;
  jabatanLama: string;
  jabatanBaru: string;
  alasan: string;
}

export interface RiwayatPangkat {
  id: string;
  golongan: GolonganRuang;
  pangkat: string;
  tmtPangkat: string;
  nomorSK: string;
  jenisKP: 'Kenaikan Pangkat Reguler' | 'Kenaikan Pangkat Pilihan' | 'Kenaikan Pangkat Pengabdian';
}

export interface Pegawai {
  id: string;
  nip: string; // 18 karakter angka standard BKN
  nama: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  jenisPegawai: JenisPegawai;
  golongan: GolonganRuang;
  pangkat: string;
  jabatan: string;
  kelasJabatan: number; // Nilai 1 s/d 17 (standard kelas jabatan ASN)
  kategoriJabatan: KategoriJabatan; // Struktural | Fungsional | Pelaksana
  jenisJabatan: JenisJabatan;
  eselon: Eselon;
  unitKerja: string; // OPD / SKPD
  subUnitKerja: string;
  jenjangPendidikan: JenjangPendidikan;
  jurusanPendidikan: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  tmtCpns: string; // YYYY-MM-DD
  tmtPangkatTerakhir: string; // YYYY-MM-DD
  tmtJabatanTerakhir: string; // YYYY-MM-DD
  masaKerjaTahun: number;
  masaKerjaBulan: number;
  statusKepegawaian: StatusKepegawaian;
  email: string;
  noHp: string;
  predikatKinerja: 'Sangat Baik' | 'Baik' | 'Butuh Perbaikan';
  diklatTerakhir?: string;
  batasUsiaPensiun: number; // 58, 60, 65 tahun
  riwayatMutasi: RiwayatMutasi[];
  riwayatPangkat: RiwayatPangkat[];
}

export interface FormasiUnitKerja {
  unitKerja: string;
  kodeUnit: string;
  kebutuhanABK: number;
}

