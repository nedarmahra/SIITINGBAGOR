import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'super_admin' | 'admin_organisasi' | 'pengelola_opd' | 'pimpinan';

export interface SystemAccount {
  id: string;
  username: string; // ID Login unik (huruf kecil, angka, garis bawah)
  password: string; // Kata sandi akun
  nama: string; // Nama lengkap & gelar
  nip?: string;
  unitKerja: string; // Satuan Kerja / OPD
  role: UserRole;
  roleLabel: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  catatan?: string;
}

// Akun bawaan resmi yang telah diterbitkan oleh Super Admin Bagian Organisasi
export const DEFAULT_SYSTEM_ACCOUNTS: SystemAccount[] = [
  {
    id: 'acc_superadmin',
    username: 'superadmin',
    password: 'admin123',
    nama: 'Super Administrator Bagian Organisasi',
    nip: '19820514 200801 1 005',
    unitKerja: 'Bagian Organisasi Sekretariat Daerah',
    role: 'super_admin',
    roleLabel: 'Super Admin Bagian Organisasi',
    status: 'aktif',
    createdAt: '2026-01-01T08:00:00.000Z',
    createdBy: 'Sistem Organisasi Setda',
    catatan: 'Akun Super Admin Utama dengan kewenangan menerbitkan akun dan kendali penuh data.'
  },
  {
    id: 'acc_admin_organisasi',
    username: 'admin_organisasi',
    password: 'organisasi123',
    nama: 'Staf Bagian Organisasi Setda',
    nip: '19850912 201001 1 008',
    unitKerja: 'Bagian Organisasi Sekretariat Daerah',
    role: 'admin_organisasi',
    roleLabel: 'Admin Bagian Organisasi Setda',
    status: 'aktif',
    createdAt: '2026-01-02T08:00:00.000Z',
    createdBy: 'superadmin',
    catatan: 'Pengelola teknis analisis bezetting dan kebutuhan ABK tingkat Kabupaten.'
  },
  {
    id: 'acc_operator_dinkes',
    username: 'operator_dinkes',
    password: 'dinkes123',
    nama: 'Hj. Dewi Sartika, S.Kep., Ners.',
    nip: '19881120 201101 2 003',
    unitKerja: 'Dinas Kesehatan',
    role: 'pengelola_opd',
    roleLabel: 'Pengelola Kepegawaian Satker / OPD',
    status: 'aktif',
    createdAt: '2026-01-03T09:00:00.000Z',
    createdBy: 'superadmin',
    catatan: 'Operator Kepegawaian Satker Dinas Kesehatan Kabupaten Bandung Barat.'
  },
  {
    id: 'acc_operator_disdik',
    username: 'operator_disdik',
    password: 'disdik123',
    nama: 'Dadan Ramdani, S.Pd., M.M.',
    nip: '19830415 200902 1 004',
    unitKerja: 'Dinas Pendidikan',
    role: 'pengelola_opd',
    roleLabel: 'Pengelola Kepegawaian Satker / OPD',
    status: 'aktif',
    createdAt: '2026-01-03T09:30:00.000Z',
    createdBy: 'superadmin',
    catatan: 'Operator Kepegawaian Satker Dinas Pendidikan Kabupaten Bandung Barat.'
  },
  {
    id: 'acc_pimpinan_organisasi',
    username: 'kabag_organisasi',
    password: 'pimpinan123',
    nama: 'Kepala Bagian Organisasi',
    nip: '19750312 199903 1 004',
    unitKerja: 'Bagian Organisasi Sekretariat Daerah',
    role: 'pimpinan',
    roleLabel: 'Pejabat Struktural / Pimpinan',
    status: 'aktif',
    createdAt: '2026-01-02T10:00:00.000Z',
    createdBy: 'superadmin',
    catatan: 'Akses pimpinan untuk evaluasi makro bezetting dan pengesahan telaahan staf.'
  }
];

const STORAGE_ACCOUNTS_KEY = 'si_iting_system_accounts_v2';
const STORAGE_SESSION_KEY = 'si_iting_current_session_v2';

interface AuthContextType {
  currentUser: SystemAccount | null;
  accounts: SystemAccount[];
  loading: boolean;
  isSuperAdmin: boolean;
  loginWithUsername: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  // Super Admin Account Management functions
  createAccount: (data: {
    username: string;
    password: string;
    nama?: string;
    nip?: string;
    unitKerja?: string;
    role?: UserRole;
    catatan?: string;
  }) => Promise<SystemAccount>;
  updateAccount: (id: string, updates: Partial<SystemAccount>) => Promise<void>;
  toggleAccountStatus: (id: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  resetAccountPassword: (id: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin Bagian Organisasi';
    case 'admin_organisasi':
      return 'Admin Bagian Organisasi Setda';
    case 'pengelola_opd':
      return 'Pengelola Kepegawaian Satker / OPD';
    case 'pimpinan':
      return 'Pejabat Struktural / Pimpinan';
    default:
      return 'Pengguna Resmi';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<SystemAccount[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (stored) {
        const parsed: SystemAccount[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load accounts from storage', e);
    }
    return DEFAULT_SYSTEM_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<SystemAccount | null>(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Sync accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to persist accounts', e);
    }
  }, [accounts]);

  // Sync session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Login handler strictly via Username and Password
  const loginWithUsername = async (usernameInput: string, passwordInput: string): Promise<void> => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200)); // small delay for natural feedback

    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    const matched = accounts.find(
      (acc) => acc.username.toLowerCase() === cleanUsername
    );

    if (!matched) {
      setLoading(false);
      throw new Error(
        'Akun tidak terdaftar. Form masuk SI-ITING hanya menerima akun resmi yang telah dibuat oleh Super Admin Bagian Organisasi.'
      );
    }

    if (matched.status !== 'aktif') {
      setLoading(false);
      throw new Error(
        'Akun ini sedang DINONAKTIFKAN oleh Super Admin. Silakan hubungi Administrator Bagian Organisasi Setda KBB.'
      );
    }

    if (matched.password !== cleanPassword) {
      setLoading(false);
      throw new Error(
        'Kata sandi salah. Harap periksa kembali atau hubungi Super Admin untuk reset kata sandi.'
      );
    }

    // Success login
    setCurrentUser(matched);
    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  };

  // SUPER ADMIN ACTIONS
  const createAccount = async (
    data: {
      username: string;
      password: string;
      nama?: string;
      nip?: string;
      unitKerja?: string;
      role?: UserRole;
      catatan?: string;
    }
  ): Promise<SystemAccount> => {
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!cleanUsername) {
      throw new Error('Username / ID Login tidak boleh kosong dan hanya boleh memuat huruf, angka, titik, atau garis bawah.');
    }

    // Check duplicate
    const exists = accounts.some(a => a.username.toLowerCase() === cleanUsername);
    if (exists) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh akun lain. Silakan buat username unik.`);
    }

    if (!data.password || data.password.length < 5) {
      throw new Error('Kata sandi awal minimal 5 karakter.');
    }

    const assignedRole: UserRole = data.role || 'pengelola_opd';
    const assignedNama = data.nama?.trim() || cleanUsername;
    const assignedUnit = data.unitKerja?.trim() || 'Bagian Organisasi Setda KBB';

    const newAccount: SystemAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      password: data.password.trim(),
      nama: assignedNama,
      nip: data.nip?.trim() || undefined,
      unitKerja: assignedUnit,
      role: assignedRole,
      roleLabel: getRoleLabel(assignedRole),
      status: 'aktif',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.username || 'superadmin',
      catatan: data.catatan?.trim() || undefined
    };

    setAccounts(prev => [newAccount, ...prev]);
    return newAccount;
  };

  const updateAccount = async (id: string, updates: Partial<SystemAccount>): Promise<void> => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const updated = { ...acc, ...updates, updatedAt: new Date().toISOString() };
          if (updates.role) {
            updated.roleLabel = getRoleLabel(updates.role);
          }
          // If updating active user session
          if (currentUser && currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return acc;
      })
    );
  };

  const toggleAccountStatus = async (id: string): Promise<void> => {
    const target = accounts.find(a => a.id === id);
    if (target?.username === 'superadmin') {
      throw new Error('Akun Super Admin Utama tidak dapat dinonaktifkan.');
    }

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const newStatus = acc.status === 'aktif' ? 'nonaktif' : 'aktif';
          const updated = { ...acc, status: newStatus as 'aktif' | 'nonaktif', updatedAt: new Date().toISOString() };
          if (currentUser && currentUser.id === id && newStatus === 'nonaktif') {
            logout();
          }
          return updated;
        }
        return acc;
      })
    );
  };

  const deleteAccount = async (id: string): Promise<void> => {
    const target = accounts.find(a => a.id === id);
    if (target?.username === 'superadmin') {
      throw new Error('Akun Super Admin Utama tidak dapat dihapus demi keamanan sistem.');
    }

    setAccounts(prev => prev.filter(acc => acc.id !== id));
    if (currentUser?.id === id) {
      logout();
    }
  };

  const resetAccountPassword = async (id: string, newPass: string): Promise<void> => {
    if (!newPass || newPass.trim().length < 5) {
      throw new Error('Kata sandi baru minimal 5 karakter.');
    }

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const updated = { ...acc, password: newPass.trim(), updatedAt: new Date().toISOString() };
          if (currentUser && currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return acc;
      })
    );
  };

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.username === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        loading,
        isSuperAdmin,
        loginWithUsername,
        logout,
        createAccount,
        updateAccount,
        toggleAccountStatus,
        deleteAccount,
        resetAccountPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
