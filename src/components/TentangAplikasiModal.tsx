import React from 'react';
import { X, Building2, ShieldCheck, BarChart3, Users, FileSpreadsheet, MapPin, Award } from 'lucide-react';

interface TentangAplikasiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TentangAplikasiModal: React.FC<TentangAplikasiModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header with KBB Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 relative overflow-hidden border-b border-emerald-900/50">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-600 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-slate-950/70 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-3xs uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Aplikasi Resmi Pemkab Bandung Barat
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>SI-ITING</span>
                  <span className="text-xs font-normal text-amber-300/90 italic">“Data Tepat, Keputusan Tepat”</span>
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Sistem Informasi Bezetting — Bagian Organisasi Setda Kab. Bandung Barat
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Creator & Tagline Attribution Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3.5">
            <Building2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-950">
                  Dibuat &amp; Dikelola oleh Bagian Organisasi Kabupaten Bandung Barat
                </span>
              </div>
              <p className="text-xs text-amber-900/85 leading-relaxed">
                Aplikasi <strong>SI-ITING</strong> (<em>Sistem Informasi Bezetting</em>) dengan prinsip <strong>“Data Tepat, Keputusan Tepat”</strong> hadir sebagai instrumen digital strategis untuk mempermudah perhitungan, pemantauan, dan analisis data bezetting aparatur sipil negara (PNS &amp; PPPK) di seluruh perangkat daerah Kabupaten Bandung Barat.
              </p>
            </div>
          </div>

          {/* Fitur Utama */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Fitur Unggulan SI-ITING</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>Dashboard Visual Real-Time</span>
                </div>
                <p className="text-slate-500 text-2xs leading-relaxed">
                  Pemantauan komposisi aparatur, perbandingan PNS/PPPK, distribusi kelas jabatan, dan piramida generasi.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Rekapitulasi Bezetting &amp; ABK</span>
                </div>
                <p className="text-slate-500 text-2xs leading-relaxed">
                  Perhitungan selisih formasi per OPD, nominatif kenaikan pangkat, dan proyeksi batas usia pensiun (BUP).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Pembaruan &amp; Ganti Data Cepat</span>
                </div>
                <p className="text-slate-500 text-2xs leading-relaxed">
                  Import file Excel/CSV dengan fitur Ganti Data (Replace) dan auto-deteksi kolom NIP, nama lengkap, dan jabatan.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Cetak Tata Naskah Dinas Resmi</span>
                </div>
                <p className="text-slate-500 text-2xs leading-relaxed">
                  Laporan ber-Kop resmi Sekretariat Daerah Kabupaten Bandung Barat siap cetak dan ekspor format CSV/PDF.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info Box */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Kompleks Perkantoran Pemkab Bandung Barat, Ngamprah</span>
            </div>
            <span className="font-semibold text-slate-700">
              Bagian Organisasi Setda KBB &copy; {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
