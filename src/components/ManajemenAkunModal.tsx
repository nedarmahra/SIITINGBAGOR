import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Search, 
  Trash2, 
  Power, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCog,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ManajemenAkunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNotification?: (msg: string) => void;
}

export const ManajemenAkunModal: React.FC<ManajemenAkunModalProps> = ({
  isOpen,
  onClose,
  onSuccessNotification
}) => {
  const { 
    currentUser, 
    accounts, 
    createAccount, 
    toggleAccountStatus, 
    deleteAccount, 
    resetAccountPassword 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'daftar' | 'tambah'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');

  // Form penerbitan akun baru: HANYA Username dan Kata Sandi Awal
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Reset password state
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFormState = () => {
    setNewUsername('');
    setNewPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setResettingId(null);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = newUsername.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    const cleanPass = newPassword.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Username/ID Login dan Kata Sandi Awal wajib diisi.');
      return;
    }

    if (cleanPass.length < 5) {
      setErrorMsg('Kata sandi awal minimal 5 karakter.');
      return;
    }

    try {
      const created = await createAccount({
        username: cleanUser,
        password: cleanPass
      });

      setSuccessMsg(`Akun resmi dengan username "${created.username}" berhasil diterbitkan.`);
      onSuccessNotification?.(`Akun "${created.username}" berhasil diterbitkan oleh Super Admin.`);
      resetFormState();
      setActiveTab('daftar');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat akun.');
    }
  };

  const handleToggleStatus = async (id: string, username: string) => {
    try {
      await toggleAccountStatus(id);
      onSuccessNotification?.(`Status akun "${username}" berhasil diubah.`);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status akun.');
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (confirm(`Yakin ingin menghapus akun "${username}" secara permanen? Akun ini tidak akan dapat masuk ke SI-ITING lagi.`)) {
      try {
        await deleteAccount(id);
        onSuccessNotification?.(`Akun "${username}" telah dihapus.`);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus akun.');
      }
    }
  };

  const handleSaveResetPassword = async (id: string) => {
    if (!resetNewPass.trim() || resetNewPass.trim().length < 5) {
      alert('Kata sandi baru minimal 5 karakter.');
      return;
    }
    try {
      await resetAccountPassword(id, resetNewPass.trim());
      setResettingId(null);
      setResetNewPass('');
      onSuccessNotification?.('Kata sandi berhasil diatur ulang.');
    } catch (err: any) {
      alert(err.message || 'Gagal mengatur ulang kata sandi.');
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const q = searchQuery.toLowerCase();
    return (
      acc.username.toLowerCase().includes(q) ||
      (acc.nama && acc.nama.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden relative my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <UserCog className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Kelola Akun Pengguna (Super Admin)
                </h3>
                <span className="text-3xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Otoritas Penuh
                </span>
              </div>
              <p className="text-3xs sm:text-2xs text-slate-300 mt-0.5">
                Penerbitan akun resmi bagi aparatur/operator untuk akses Sistem Informasi Bezetting SI-ITING.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => { setActiveTab('daftar'); resetFormState(); }}
            className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'daftar'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Daftar Akun Terdaftar ({accounts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('tambah'); resetFormState(); }}
            className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'tambah'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Terbitkan Akun Baru</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: DAFTAR AKUN */}
          {activeTab === 'daftar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan username/ID login akun..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="text-3xs text-slate-500 font-semibold self-center sm:self-auto whitespace-nowrap">
                  Total: <span className="text-slate-900 font-bold">{filteredAccounts.length}</span> akun terdaftar
                </div>
              </div>

              {/* Table Accounts */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-3xs uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Username / ID Login</th>
                        <th className="py-2.5 px-3">Kata Sandi</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Diterbitkan</th>
                        <th className="py-2.5 px-3 text-right">Aksi Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredAccounts.map((acc) => {
                        const isCurrent = currentUser?.id === acc.id;
                        const isRootAdmin = acc.username === 'superadmin';

                        return (
                          <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 align-top font-mono">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{acc.username}</span>
                                {isCurrent && (
                                  <span className="text-4xs px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold font-sans">
                                    Anda
                                  </span>
                                )}
                              </div>
                              {acc.nama && acc.nama !== acc.username && (
                                <div className="text-3xs text-slate-500 font-sans mt-0.5">
                                  {acc.nama}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top font-mono">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
                                {acc.password}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-top">
                              <button
                                onClick={() => handleToggleStatus(acc.id, acc.username)}
                                disabled={isRootAdmin}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-3xs font-bold uppercase transition-colors ${
                                  acc.status === 'aktif'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                                } ${isRootAdmin ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={isRootAdmin ? 'Akun Super Admin Utama selalu aktif' : 'Klik untuk mengubah status'}
                              >
                                <Power className="w-2.5 h-2.5" />
                                <span>{acc.status}</span>
                              </button>
                            </td>

                            <td className="py-3 px-3 align-top text-slate-500 text-3xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{new Date(acc.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Reset Password Button */}
                                <button
                                  onClick={() => {
                                    setResettingId(acc.id);
                                    setResetNewPass('');
                                  }}
                                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                  title="Ganti / Reset Kata Sandi"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                {!isRootAdmin && (
                                  <button
                                    onClick={() => handleDelete(acc.id, acc.username)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Hapus Akun"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Inline Reset Password Box */}
                              {resettingId === acc.id && (
                                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-left shadow-sm">
                                  <div className="text-3xs font-bold text-amber-900 mb-1">
                                    Set Sandi Baru ({acc.username}):
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      placeholder="Sandi baru..."
                                      value={resetNewPass}
                                      onChange={(e) => setResetNewPass(e.target.value)}
                                      className="px-2 py-1 text-2xs bg-white border border-amber-300 rounded focus:outline-none w-28 font-mono"
                                    />
                                    <button
                                      onClick={() => handleSaveResetPassword(acc.id)}
                                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-3xs font-bold rounded cursor-pointer"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      onClick={() => setResettingId(null)}
                                      className="px-1.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-3xs rounded cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERBITKAN AKUN BARU - HANYA USERNAME & KATA SANDI AWAL */}
          {activeTab === 'tambah' && (
            <form onSubmit={handleCreateAccount} className="max-w-lg mx-auto space-y-4 py-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Penerbitan Akun Akses SI-ITING:</strong> Cukup masukkan <strong>Username / ID Login</strong> dan <strong>Kata Sandi Awal</strong>. Akun yang diterbitkan langsung aktif dan dapat digunakan untuk masuk ke dalam sistem.
                </div>
              </div>

              {/* Form Input 1: Username / ID Login */}
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username / ID Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: operator_dinkes atau petugas1"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 shadow-2xs"
                />
                <span className="text-3xs text-slate-400 mt-1 block">
                  Hanya huruf kecil, angka, titik, atau garis bawah.
                </span>
              </div>

              {/* Form Input 2: Kata Sandi Awal */}
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Awal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={5}
                    placeholder="Minimal 5 karakter (misal: dinkes123)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNewPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-3xs text-slate-400 mt-1 block">
                  Gunakan kombinasi minimal 5 karakter yang mudah diingat oleh aparatur terkait.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setActiveTab('daftar'); resetFormState(); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md"
                >
                  <UserPlus className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                  <span>Terbitkan Akun</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
