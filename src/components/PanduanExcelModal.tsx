import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Info, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  EXCEL_IMPORT_COLUMNS, 
  SAMPLE_EXCEL_ROWS, 
  downloadImportTemplate, 
  downloadFormattedExcelTemplate, 
  copyTemplateToClipboard 
} from '../utils/asnHelpers';

interface PanduanExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportModal: () => void;
}

export const PanduanExcelModal: React.FC<PanduanExcelModalProps> = ({
  isOpen,
  onClose,
  onOpenImportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'kamus' | 'tabel' | 'download'>('kamus');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyTemplateToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-3xs font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                  SI-ITING
                </span>
                <span className="text-3xs text-amber-300 italic font-medium">
                  “Data Tepat, Keputusan Tepat”
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Formulir Excel &amp; Panduan Pengisian Bezetting ASN</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Format Baku Bagian Organisasi KBB
                </span>
              </h2>
              <p className="text-2xs text-slate-400 mt-0.5">
                Panduan praktis pengisian tabel agar data bezetting terbaca 100% akurat tanpa kegagalan impor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Top Bar: Fast Download & Copy */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-950 font-medium">
              Unduh formulir siap pakai, atau salin format langsung ke Microsoft Excel / Google Sheets:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Salin ke Clipboard */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-slate-800 hover:bg-amber-100/70 rounded-md text-xs font-semibold shadow-2xs transition-colors"
              title="Salin tabel ke clipboard, lalu Anda cukup tekan Ctrl+V pada Microsoft Excel"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin ke Excel (Ctrl+V)</span>
                </>
              )}
            </button>

            {/* Unduh Excel .xls Resmi */}
            <button
              onClick={downloadFormattedExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold shadow-sm transition-colors"
              title="Unduh file spreadsheet Excel resmi dengan tata letak berwarna dan petunjuk kolom tersemat"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xls)</span>
            </button>

            {/* Unduh CSV UTF-8 */}
            <button
              onClick={downloadImportTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
              title="Unduh format CSV standar kompatibel semua versi software spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV (.csv)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 bg-slate-50 flex items-center gap-6 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('kamus')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'kamus'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Kamus Nilai Baku (Aturan Pilihan)</span>
          </button>
          <button
            onClick={() => setActiveTab('tabel')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tabel'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            <span>Pratinjau Contoh Formulir Excel (6 Baris)</span>
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-4 h-4 text-emerald-500" />
            <span>Daftar 12 Kolom &amp; Contoh Lengkap</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {/* TAB 1: Kamus Nilai Baku (Paling penting agar mudah dipahami) */}
          {activeTab === 'kamus' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tips Mempermudah Pengisian:</span>
                  <p className="text-2xs text-blue-800 mt-0.5">
                    Agar data tidak tertolak saat impor, gunakan pilihan kata baku berikut pada kolom Excel Anda:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Status Kepegawaian */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Kolom Status Kepegawaian</span>
                    <span className="text-3xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                      Wajib Diisi
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500">Pilih salah satu dari 3 status resmi:</p>
                  <div className="space-y-1.5 text-2xs">
                    <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded border border-emerald-100">
                      <code className="font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">Aktif</code>
                      <span className="text-slate-600">Pegawai masih berdinas aktif di instansi pemerintah</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-200">
                      <code className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-300">Pensiun</code>
                      <span className="text-slate-600">Pegawai telah purna tugas / mencapai batas usia pensiun</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-amber-50 rounded border border-amber-100">
                      <code className="font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">Mutasi</code>
                      <span className="text-slate-600">Pegawai berstatus mutasi keluar/pindah satuan kerja</span>
                    </div>
                  </div>
                </div>

                {/* 2. Jenis Jabatan */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Kolom Jenis Jabatan</span>
                    <span className="text-3xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                      Wajib Diisi
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500">Pilih salah satu dari 3 rumpun jabatan:</p>
                  <div className="space-y-1.5 text-2xs">
                    <div className="flex items-center gap-2 p-1.5 bg-blue-50 rounded border border-blue-100">
                      <code className="font-bold text-blue-800 bg-white px-1.5 py-0.5 rounded border border-blue-200">Struktural</code>
                      <span className="text-slate-600">Pejabat struktural (Kepala Dinas, Sekretaris, Kabid, Kasubag)</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded border border-emerald-100">
                      <code className="font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">Fungsional</code>
                      <span className="text-slate-600">Pejabat fungsional keahlian/keterampilan (Guru, Dokter, Pranata Komputer)</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-200">
                      <code className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-300">Pelaksana</code>
                      <span className="text-slate-600">Staf pelaksana administrasi/operasional</span>
                    </div>
                  </div>
                </div>

                {/* 3. Kelas Jabatan */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Kolom Kelas Jabatan (1 s/d 17)</span>
                    <span className="text-3xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                      Wajib Diisi
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500">Cukup isi angka dari 1 sampai 17 sesuai tabel berikut:</p>
                  <div className="grid grid-cols-2 gap-1.5 text-2xs">
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 font-mono">14 - 15</span>: Kepala Dinas / Badan (JPT)
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 font-mono">11 - 12</span>: Kepala Bidang / Bagian (Admin)
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 font-mono">9</span>: Kasubag / JF Ahli Muda
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 font-mono">8</span>: JF Ahli Pertama
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 font-mono">5 - 7</span>: Pelaksana / JF Keterampilan
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 font-mono">1 - 4</span>: Pelaksana Dasar
                    </div>
                  </div>
                </div>

                {/* 4. NIP & Usia Otomatis */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">NIP 18 Digit &amp; Usia Otomatis</span>
                    <span className="text-3xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500">
                    Bila NIP diisi 18 angka standard BKN (contoh: <code>198504122010011004</code>), sistem akan otomatis:
                  </p>
                  <ul className="list-disc list-inside text-2xs space-y-1 text-slate-600">
                    <li>Mengekstrak tanggal lahir (12 April 1985)</li>
                    <li>Menghitung usia saat ini secara otomatis (39 Tahun)</li>
                    <li>Mendeteksi Jenis Kelamin (Laki-laki / Perempuan)</li>
                    <li>Mengekstrak TMT CPNS (Tahun 2010)</li>
                  </ul>
                  <p className="text-3xs text-amber-700 font-medium">
                    * Kolom Usia di Excel bersifat opsional, karena akan dihitung otomatis dari NIP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pratinjau Tabel Excel */}
          {activeTab === 'tabel' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Contoh Tampilan Baris Form Excel:</h3>
                  <p className="text-2xs text-slate-500">
                    Tabel ini memperlihatkan contoh riil pengisian data untuk berbagai skenario ASN:
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Tersalin!' : 'Salin Semua Baris'}</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-2xs border-collapse">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="p-2 text-center w-8">No</th>
                      <th className="p-2">NIP</th>
                      <th className="p-2">Nama Lengkap</th>
                      <th className="p-2">Jenis</th>
                      <th className="p-2">Gol</th>
                      <th className="p-2">Jabatan</th>
                      <th className="p-2 text-center">Kelas</th>
                      <th className="p-2">Jenis Jabatan</th>
                      <th className="p-2">Unit Kerja</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2">Pendidikan</th>
                      <th className="p-2 text-center">Usia</th>
                      <th className="p-2">No HP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {SAMPLE_EXCEL_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-2 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-2 font-mono text-slate-700 whitespace-nowrap">{row[0]}</td>
                        <td className="p-2 font-semibold text-slate-900 whitespace-nowrap">{row[1]}</td>
                        <td className="p-2 font-mono">{row[2]}</td>
                        <td className="p-2 font-mono font-bold text-slate-800">{row[3]}</td>
                        <td className="p-2 text-slate-800 whitespace-nowrap">{row[4]}</td>
                        <td className="p-2 text-center font-mono font-bold text-amber-700">{row[5]}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded font-semibold text-3xs ${
                            row[6] === 'Struktural' ? 'bg-blue-50 text-blue-700' :
                            row[6] === 'Fungsional' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row[6]}
                          </span>
                        </td>
                        <td className="p-2 truncate max-w-[150px] text-slate-700">{row[7]}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-3xs ${
                            row[8] === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                            row[8] === 'Pensiun' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {row[8]}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap text-slate-600">{row[9]}</td>
                        <td className="p-2 text-center font-mono text-slate-700">{row[10]}</td>
                        <td className="p-2 font-mono text-slate-500 whitespace-nowrap">{row[11]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Daftar 12 Kolom & Rincian */}
          {activeTab === 'download' && (
            <div className="space-y-3">
              <p className="text-2xs text-slate-500">
                Berikut rincian lengkap 12 kolom formulir import beserta contoh dan keterangan fungsi masing-masing kolom:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXCEL_IMPORT_COLUMNS.map((col, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {idx + 1}. {col.header}
                      </span>
                      <span className={`text-3xs font-semibold px-2 py-0.5 rounded ${
                        col.wajib 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {col.wajib ? 'Wajib' : 'Opsional'}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600">{col.keterangan}</p>
                    <div className="pt-1 text-3xs text-slate-500 flex items-center gap-1 font-mono">
                      <span className="text-slate-400 font-sans">Contoh:</span>
                      <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{col.contoh}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-2xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Format tabel ini diuji dan sesuai 100% dengan pangkalan data BKN.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenImportModal();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded transition-colors shadow-sm"
            >
              <span>Buka Menu Import Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
