import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { formatTanggalIndo } from '../utils/asnHelpers';

interface CetakLaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

export const CetakLaporanModal: React.FC<CetakLaporanModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
}) => {
  if (!isOpen || !data) return null;

  const todayStr = formatTanggalIndo(new Date().toISOString().split('T')[0]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xs font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                SI-ITING
              </span>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Pratinjau Lembar Rekapitulasi Cetak Resmi
              </h2>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              Tata naskah dinas resmi Bagian Organisasi Sekretariat Daerah Kabupaten Bandung Barat · <em>“Data Tepat, Keputusan Tepat”</em>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 text-slate-900 bg-white font-sans text-xs">
          {/* Formal Indonesian Government Kop Surat Pemkab Bandung Barat */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-800">
              PEMERINTAH KABUPATEN BANDUNG BARAT
            </h3>
            <h1 className="text-base sm:text-lg uppercase font-black text-slate-950 tracking-wider mt-0.5">
              SEKRETARIAT DAERAH
            </h1>
            <h2 className="text-xs sm:text-sm uppercase font-extrabold text-slate-900 tracking-wide">
              BAGIAN ORGANISASI
            </h2>
            <p className="text-3xs text-slate-600 font-mono mt-0.5">
              Kompleks Perkantoran Pemkab Bandung Barat, Gedung Sekretariat Daerah Lt. 2, Jl. Raya Padalarang - Cisarua KM. 2, Mekarsari, Ngamprah 40552
            </p>
            <p className="text-3xs text-slate-500 font-mono">
              SI-ITING — Sistem Informasi Bezetting ASN Kabupaten Bandung Barat · “Data Tepat, Keputusan Tepat”
            </p>
          </div>

          {/* Document Title & Reference */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide underline underline-offset-4 text-slate-950">
              {title}
            </h2>
            <p className="text-2xs text-slate-600 font-mono mt-1">
              Nomor: 800.1.3/REKAP/{new Date().getFullYear()} · Posisi Data per {todayStr}
            </p>
          </div>

          {/* Table Data Render depending on type */}
          <div className="overflow-x-auto my-4">
            {data.type === 'opd' && (
              <table className="w-full text-left text-2xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-1.5 border border-slate-300 text-center w-8">No</th>
                    <th className="p-1.5 border border-slate-300">Satuan Kerja / OPD</th>
                    <th className="p-1.5 border border-slate-300 text-center" colSpan={3}>PNS</th>
                    <th className="p-1.5 border border-slate-300 text-center" colSpan={3}>PPPK</th>
                    <th className="p-1.5 border border-slate-300 text-center font-bold">Total ASN</th>
                    <th className="p-1.5 border border-slate-300 text-center">ABK</th>
                    <th className="p-1.5 border border-slate-300 text-center">Selisih</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600 font-medium text-3xs border-b border-slate-300">
                    <th className="border border-slate-300"></th>
                    <th className="border border-slate-300"></th>
                    <th className="border border-slate-300 text-center">L</th>
                    <th className="border border-slate-300 text-center">P</th>
                    <th className="border border-slate-300 text-center font-bold text-slate-900">Jml</th>
                    <th className="border border-slate-300 text-center">L</th>
                    <th className="border border-slate-300 text-center">P</th>
                    <th className="border border-slate-300 text-center font-bold text-slate-900">Jml</th>
                    <th className="border border-slate-300"></th>
                    <th className="border border-slate-300"></th>
                    <th className="border border-slate-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{i + 1}</td>
                      <td className="p-1.5 border border-slate-300 font-medium">{row.unitKerja}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{row.pnsL}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{row.pnsP}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50">{row.totalPns}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{row.pppkL}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{row.pppkP}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50">{row.totalPppk}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">{row.totalEksisting}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{row.kuotaAbk}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">
                        {row.selisih < 0 ? `Kurang (${row.selisih})` : row.selisih > 0 ? `Lebih (+${row.selisih})` : 'Ideal'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td className="p-1.5 border border-slate-300 text-center" colSpan={2}>TOTAL</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.pnsL}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.pnsP}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.totalPns}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.pppkL}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.pppkP}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.totalPppk}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono font-extrabold">{data.grandTotal.totalEksisting}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.kuotaAbk}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{data.grandTotal.selisih}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {data.type === 'golongan' && (
              <table className="w-full text-left text-2xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Golongan / Ruang</th>
                    <th className="p-2 border border-slate-300">Nama Pangkat Resmi</th>
                    <th className="p-2 border border-slate-300 text-center">Laki-laki</th>
                    <th className="p-2 border border-slate-300 text-center">Perempuan</th>
                    <th className="p-2 border border-slate-300 text-center font-bold">Total</th>
                    <th className="p-2 border border-slate-300 text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono font-bold">{row.golongan}</td>
                      <td className="p-2 border border-slate-300">{row.namaPangkat}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.l}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.p}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{row.total}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.persentase}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data.type === 'jabatan_pendidikan' && (
              <table className="w-full text-left text-2xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Jenis Jabatan ASN</th>
                    <th className="p-2 border border-slate-300 text-center">S-3</th>
                    <th className="p-2 border border-slate-300 text-center">S-2</th>
                    <th className="p-2 border border-slate-300 text-center">S-1 / D-4</th>
                    <th className="p-2 border border-slate-300 text-center">D-3</th>
                    <th className="p-2 border border-slate-300 text-center">SLTA</th>
                    <th className="p-2 border border-slate-300 text-center font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border border-slate-300 font-medium">{row.jenisJabatan}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.s3}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.s2}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.s1}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.d3}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.slta}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data.type === 'pensiun' && (
              <table className="w-full text-left text-2xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Nama Pegawai / NIP</th>
                    <th className="p-2 border border-slate-300">Satuan Kerja & Jabatan</th>
                    <th className="p-2 border border-slate-300 text-center">Golongan</th>
                    <th className="p-2 border border-slate-300 text-center">BUP</th>
                    <th className="p-2 border border-slate-300 text-center">TMT Pensiun</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border border-slate-300">
                        <span className="font-bold">{row.pegawai.nama}</span>
                        <span className="block text-3xs font-mono text-slate-600">{row.pegawai.nip}</span>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <span>{row.pegawai.jabatan}</span>
                        <span className="block text-3xs text-slate-500">{row.pegawai.unitKerja}</span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{row.pegawai.golongan}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.bup} Th</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{formatTanggalIndo(row.tanggalPensiun)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data.type === 'kp' && (
              <table className="w-full text-left text-2xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Nama Pegawai & NIP</th>
                    <th className="p-2 border border-slate-300">Satuan Kerja & Jabatan</th>
                    <th className="p-2 border border-slate-300 text-center">Golongan</th>
                    <th className="p-2 border border-slate-300 text-center">Masa Kerja</th>
                    <th className="p-2 border border-slate-300 text-center">Periode Usulan KP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border border-slate-300">
                        <span className="font-bold">{row.pegawai.nama}</span>
                        <span className="block text-3xs font-mono text-slate-600">{row.pegawai.nip}</span>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <span>{row.pegawai.jabatan}</span>
                        <span className="block text-3xs text-slate-500">{row.pegawai.unitKerja}</span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{row.pegawai.golongan}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{row.tahunBerjalan} Tahun</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{row.periodeBerikutnya}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Official Endorsement Signature Block */}
          <div className="mt-12 flex justify-end">
            <div className="w-72 text-center text-2xs space-y-1">
              <p>Ngamprah, {todayStr}</p>
              <p className="font-semibold mt-1">
                KEPALA BAGIAN ORGANISASI<br />
                SEKRETARIAT DAERAH KABUPATEN BANDUNG BARAT
              </p>
              <div className="h-16 flex items-center justify-center text-slate-300 font-serif italic text-3xs">
                [ Tanda Tangan & Cap Dinas Resmi ]
              </div>
              <p className="font-bold underline text-slate-950">
                Drs. H. DUDDY SUPRIADI, M.Si.
              </p>
              <p className="font-mono text-3xs text-slate-700">Pembina Tingkat I (IV/b)</p>
              <p className="font-mono text-3xs text-slate-700">NIP. 19740512 199803 1 004</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
