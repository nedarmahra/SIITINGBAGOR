import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  BarChart3, 
  Plus, 
  ShieldCheck, 
  Info, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  UserCog,
  Building2,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'rekapitulasi' | 'pegawai';
  setActiveTab: (tab: 'dashboard' | 'rekapitulasi' | 'pegawai') => void;
  onTambahPegawai: () => void;
  onOpenTentangModal?: () => void;
  onOpenLoginModal?: () => void;
  onOpenManajemenAkun?: () => void;
  totalPegawai: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTambahPegawai,
  onOpenTentangModal,
  onOpenLoginModal,
  onOpenManajemenAkun,
  totalPegawai,
}) => {
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatter for role badge in compact view
  const getShortRole = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin_organisasi':
        return 'Admin Setda';
      case 'pengelola_opd':
        return 'Operator OPD';
      case 'pimpinan':
        return 'Pimpinan';
      default:
        return 'Pengguna';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 gap-3 lg:gap-6">
          
          {/* ZONE 1: BRANDING & IDENTITAS */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 flex items-center justify-center font-bold text-white shadow-md ring-1 ring-white/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
                  className="text-lg sm:text-xl font-black tracking-tight text-white hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>SI-ITING</span>
                </a>
                <span className="text-3xs font-extrabold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider whitespace-nowrap">
                  Bezetting ASN
                </span>
              </div>
              <p className="text-3xs text-slate-300 font-medium hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="text-amber-300 font-semibold italic">“Data Tepat, Keputusan Tepat!”</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Bagian Organisasi Setda KBB</span>
              </p>
            </div>
          </div>

          {/* ZONE 2: PRIMARY NAVIGATION TABS (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard Visual</span>
            </button>

            <button
              onClick={() => setActiveTab('rekapitulasi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'rekapitulasi'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Rekapitulasi Bezetting</span>
            </button>

            <button
              onClick={() => setActiveTab('pegawai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'pegawai'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Pegawai ASN</span>
            </button>
          </nav>

          {/* ZONE 3: ACTIONS & AUTHENTICATION */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Total Pegawai Pill Counter */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-3xs font-medium text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono font-bold text-white">{totalPegawai}</span>
              <span className="text-slate-400">Pegawai Terdata</span>
            </div>

            {/* Tentang Modal Button */}
            {onOpenTentangModal && (
              <button
                onClick={onOpenTentangModal}
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                title="Tentang SI-ITING Kabupaten Bandung Barat"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Tentang</span>
              </button>
            )}

            {/* Tambah ASN Button */}
            <button
              onClick={onTambahPegawai}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>Tambah ASN</span>
            </button>

            {/* Super Admin Kelola Akun Button */}
            {currentUser && isSuperAdmin && onOpenManajemenAkun && (
              <button
                onClick={onOpenManajemenAkun}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
                title="Kelola Akun Pengguna SI-ITING (Super Admin)"
              >
                <UserCog className="w-3.5 h-3.5 text-slate-950 stroke-[2.2]" />
                <span className="hidden sm:inline">Kelola Akun</span>
              </button>
            )}

            {/* User Account / Login Button */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-left transition-all cursor-pointer"
                  title="Klik untuk melihat detail profil atau keluar akun"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-amber-400 flex items-center justify-center font-bold text-xs text-white uppercase shadow-xs shrink-0">
                    {currentUser.nama ? currentUser.nama.charAt(0) : 'U'}
                  </div>

                  <div className="hidden sm:flex flex-col justify-center leading-tight">
                    <span className="text-xs font-bold text-white whitespace-nowrap">
                      @{currentUser.username}
                    </span>
                    <span className="text-3xs text-amber-300 font-semibold whitespace-nowrap">
                      {getShortRole(currentUser.role)}
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {/* Dropdown Menu - No text cut off, comfortable width and wrapping */}
                {showUserDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-80 sm:w-88 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* User Identity Section */}
                    <div className="px-4 py-3 border-b border-slate-100 space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-400 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
                          {currentUser.nama ? currentUser.nama.charAt(0) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Nama Lengkap - Never truncated, wraps naturally */}
                          <div className="text-xs sm:text-sm font-black text-slate-900 leading-snug break-words">
                            {currentUser.nama}
                          </div>
                          <div className="text-3xs text-slate-500 font-mono mt-0.5">
                            Username: <strong className="text-slate-800">@{currentUser.username}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Role & OPD Information - Wrapped cleanly */}
                      <div className="pt-1.5 space-y-1">
                        <div className="inline-flex items-center gap-1 text-3xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <BadgeCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{currentUser.roleLabel}</span>
                        </div>

                        <div className="text-2xs text-slate-700 font-medium flex items-start gap-1.5 pt-0.5 break-words">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{currentUser.unitKerja}</span>
                        </div>

                        {currentUser.nip && (
                          <div className="text-3xs text-slate-500 font-mono pl-5">
                            NIP: {currentUser.nip}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Inside Dropdown */}
                    <div className="p-2 space-y-1">
                      {isSuperAdmin && onOpenManajemenAkun && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenManajemenAkun();
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border border-amber-200/80"
                        >
                          <UserCog className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Kelola Akun Pengguna (Super Admin)</span>
                        </button>
                      )}

                      {onOpenTentangModal && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenTentangModal();
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Info className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Tentang Aplikasi SI-ITING</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Keluar Sistem (Log Out)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm border border-emerald-400/40 transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE & TABLET NAVIGATION STRIP (Visible below lg screens) */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800 gap-2 text-xs font-medium text-slate-300 scrollbar-none items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('rekapitulasi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'rekapitulasi'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Rekapitulasi Bezetting</span>
          </button>

          <button
            onClick={() => setActiveTab('pegawai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'pegawai'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Pegawai ASN</span>
          </button>

          {/* Quick Counter Pill in Mobile Strip */}
          <span className="ml-auto text-3xs font-mono text-slate-400 px-2 py-1 bg-slate-800/80 rounded-md border border-slate-700/60 whitespace-nowrap">
            {totalPegawai} ASN
          </span>
        </div>

      </div>
    </header>
  );
};
