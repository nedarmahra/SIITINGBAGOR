import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  Users,
  BarChart3,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const { loginWithUsername, loading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Mohon masukkan Username dan Kata Sandi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithUsername(username, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Column: Official Branding */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pemerintah Kabupaten Bandung Barat</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center lg:justify-start gap-3">
              <span>SI-ITING</span>
              <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono tracking-normal">
                BEZETTING
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-amber-300 italic">
              “Data Tepat, Keputusan Tepat!”
            </p>
            <p className="text-sm text-slate-300 font-medium">
              Sistem Informasi Bezetting ASN — Bagian Organisasi Sekretariat Daerah Kabupaten Bandung Barat
            </p>
          </div>

          {/* Core App Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-left">
              <BarChart3 className="w-4 h-4 text-amber-400 mb-1.5" />
              <div className="text-xs font-bold text-white">Analisis Bezetting Riil</div>
              <div className="text-3xs text-slate-400 mt-0.5">Komparasi akurat kekuatan personel terhadap peta formasi ABK.</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-left">
              <Users className="w-4 h-4 text-emerald-400 mb-1.5" />
              <div className="text-xs font-bold text-white">Master Pegawai PNS &amp; PPPK</div>
              <div className="text-3xs text-slate-400 mt-0.5">Struktur kepangkatan, pendidikan, usia, dan data aparatur terpadu.</div>
            </div>
          </div>

          <div className="text-2xs text-slate-400 flex items-center justify-center lg:justify-start gap-2 pt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Gedung Sekretariat Daerah Lt. 2, Kompleks Perkantoran Pemkab Bandung Barat</span>
          </div>
        </div>

        {/* Right Column: Username-Only Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header */}
            <div className="bg-slate-900 p-5 text-white border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Masuk Akun Resmi SI-ITING</span>
                  </h2>
                  <p className="text-3xs text-slate-400 mt-0.5">
                    Hanya untuk akun yang telah dibuat oleh Super Admin
                  </p>
                </div>
                <span className="text-3xs font-extrabold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-widest">
                  Otoritas Setda
                </span>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              
              {/* Notice Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-bold">Akses Khusus Akun Terdaftar:</strong>
                  Sistem ini <strong>tidak menggunakan email</strong> dan tidak membuka pendaftaran mandiri. Masuk hanya dapat menggunakan <strong>Username &amp; Kata Sandi</strong> yang telah dibuat oleh Super Admin Bagian Organisasi.
                </div>
              </div>

              {/* Alert Error */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username / ID Pengguna
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="Masukkan username akun resmi"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Memverifikasi Akun...' : (
                    <>
                      <span>Masuk ke SI-ITING</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest Access Option */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100"
                >
                  <span>Lanjutkan Sebagai Tamu (Pratinjau Publik Tanpa Login)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-3xs text-slate-400 z-10">
        SI-ITING &copy; {new Date().getFullYear()} · Bagian Organisasi Sekretariat Daerah Kabupaten Bandung Barat
      </footer>
    </div>
  );
};
