import React from 'react';
import { Pegawai } from '../types/asn';
import { formatNip, formatNamaLengkap, formatTanggalIndo, hitungUmur, hitungTanggalPensiun } from '../utils/asnHelpers';
import { 
  X, 
  User, 
  ShieldCheck,
  Building2, 
  Award
} from 'lucide-react';

interface DetailPegawaiModalProps {
  pegawai: Pegawai | null;
  onClose: () => void;
  onEdit: (pegawai: Pegawai) => void;
}

export const DetailPegawaiModal: React.FC<DetailPegawaiModalProps> = ({
  pegawai,
  onClose,
  onEdit,
}) => {
  if (!pegawai) return null;

  const age = hitungUmur(pegawai.tanggalLahir);
  const pen = hitungTanggalPensiun(pegawai.tanggalLahir, pegawai.batasUsiaPensiun);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {formatNamaLengkap(pegawai)}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>NIP. {formatNip(pegawai.nip)}</span>
                <span>·</span>
                <span className="text-amber-400 font-semibold">{pegawai.golongan} ({pegawai.jenisPegawai})</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Jabatan */}
            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Nama Jabatan</span>
              <p className="font-semibold text-slate-900 mt-0.5">{pegawai.jabatan}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{pegawai.jenisJabatan}</p>
            </div>

            {/* Kelas Jabatan & Jenis Jabatan */}
            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Kelas & Jenis Jabatan</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-xs">
                  Kelas {pegawai.kelasJabatan}
                </span>
                <span className="font-semibold text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                  {pegawai.kategoriJabatan}
                </span>
              </div>
              <p className="text-2xs text-slate-500 mt-1 font-mono">Eselon: {pegawai.eselon}</p>
            </div>

            {/* Unit Kerja */}
            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Satuan Kerja / Unit Kerja</span>
              <p className="font-semibold text-slate-900 mt-0.5">{pegawai.unitKerja}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{pegawai.subUnitKerja || '-'}</p>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Pangkat & Golongan</span>
              <p className="font-semibold text-slate-900 mt-0.5">{pegawai.pangkat}</p>
              <p className="text-2xs text-slate-500 mt-0.5 font-mono">Golongan: {pegawai.golongan}</p>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Tempat, Tanggal Lahir</span>
              <p className="font-medium text-slate-900 mt-0.5">
                {pegawai.tempatLahir}, {formatTanggalIndo(pegawai.tanggalLahir)}
              </p>
              <p className="text-2xs text-slate-500 mt-0.5 font-mono">
                Usia: {age} Tahun · Jenis Kelamin: {pegawai.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Masa Kerja & TMT CPNS</span>
              <p className="font-medium text-slate-900 mt-0.5 font-mono">
                {pegawai.masaKerjaTahun} Tahun {pegawai.masaKerjaBulan} Bulan
              </p>
              <p className="text-2xs text-slate-500 mt-0.5 font-mono">
                TMT CPNS: {formatTanggalIndo(pegawai.tmtCpns)}
              </p>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Batas Usia Pensiun (BUP)</span>
              <p className="font-medium text-slate-900 mt-0.5 font-mono">
                {formatTanggalIndo(pen.tanggalPensiun)} ({pegawai.batasUsiaPensiun} Th)
              </p>
              <p className={`text-2xs font-mono mt-0.5 ${pen.isMendekatiPensiun ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                Sisa: {pen.sisaTahun} Th {pen.sisaBulan} Bln {pen.isMendekatiPensiun ? '(Mendekati BUP)' : ''}
              </p>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Pendidikan Terakhir</span>
              <p className="font-medium text-slate-900 mt-0.5">{pegawai.jenjangPendidikan}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{pegawai.jurusanPendidikan}</p>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Status Kepegawaian</span>
              <div className="mt-0.5">
                <span className={`inline-block font-semibold text-xs px-2.5 py-0.5 rounded ${
                  pegawai.statusKepegawaian === 'Aktif'
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : pegawai.statusKepegawaian === 'Pensiun'
                    ? 'text-slate-700 bg-slate-100 border border-slate-300'
                    : 'text-amber-800 bg-amber-50 border border-amber-200'
                }`}>
                  {pegawai.statusKepegawaian}
                </span>
              </div>
            </div>

            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold">Predikat Kinerja SKP</span>
              <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{pegawai.predikatKinerja}</span>
              </p>
            </div>
          </div>

          {/* Diklat / Pelatihan Terakhir */}
          {pegawai.diklatTerakhir && (
            <div className="p-3 bg-amber-50/60 rounded-md border border-amber-200/80">
              <span className="text-2xs font-semibold text-amber-900 uppercase">Pelatihan & Diklat Terakhir</span>
              <p className="text-xs text-amber-950 font-medium mt-0.5">{pegawai.diklatTerakhir}</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(pegawai)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
          >
            Ubah Data Pegawai
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
