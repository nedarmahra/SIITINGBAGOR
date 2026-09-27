import React, { useState, useEffect } from 'react';
import { Pegawai } from './types/asn';
import { INITIAL_PEGAWAI } from './data/mockData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RecapitulasiView } from './components/RecapitulasiView';
import { DataPegawaiView } from './components/DataPegawaiView';
import { DetailPegawaiModal } from './components/DetailPegawaiModal';
import { FormPegawaiModal } from './components/FormPegawaiModal';
import { ImportDataModal, ImportStrategy } from './components/ImportDataModal';
import { PanduanExcelModal } from './components/PanduanExcelModal';
import { CetakLaporanModal } from './components/CetakLaporanModal';
import { TentangAplikasiModal } from './components/TentangAplikasiModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { ManajemenAkunModal } from './components/ManajemenAkunModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CheckCircle2, ShieldCheck, LogIn, Sparkles, UserCog } from 'lucide-react';

const STORAGE_KEY_PEGAWAI = 'simpeg_asn_pegawai_v2';

function MainAppContent() {
  const { currentUser, loading } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isManajemenAkunOpen, setIsManajemenAkunOpen] = useState(false);

  // Load initial data with localStorage fallback
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PEGAWAI);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load pegawai from localStorage', e);
    }
    return INITIAL_PEGAWAI;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PEGAWAI, JSON.stringify(pegawaiList));
    } catch (e) {
      console.error('Failed to save pegawai', e);
    }
  }, [pegawaiList]);

  // Active Tab: only dashboard, rekapitulasi, pegawai
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rekapitulasi' | 'pegawai'>('dashboard');

  // Modals state
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState<Pegawai | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStrategy, setImportStrategy] = useState<ImportStrategy>('replace');
  const [isPanduanModalOpen, setIsPanduanModalOpen] = useState(false);
  const [isTentangModalOpen, setIsTentangModalOpen] = useState(false);

  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    title: string;
    data: any;
  }>({
    isOpen: false,
    title: '',
    data: null,
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pegawai CRUD handlers
  const handleSavePegawai = (saved: Pegawai) => {
    setPegawaiList(prev => {
      const exists = prev.some(p => p.id === saved.id);
      if (exists) {
        return prev.map(p => (p.id === saved.id ? saved : p));
      } else {
        return [saved, ...prev];
      }
    });

    setIsFormModalOpen(false);
    setEditingPegawai(null);
    showToast(`Data pegawai ${saved.nama} berhasil disimpan.`);
  };

  const handleDeletePegawai = (id: string) => {
    const target = pegawaiList.find(p => p.id === id);
    setPegawaiList(prev => prev.filter(p => p.id !== id));
    showToast(`Data pegawai ${target?.nama || ''} telah dihapus.`);
  };

  // Bulk Import / Update Handler
  const handleImportSuccess = (imported: Pegawai[], strategy: ImportStrategy = 'replace') => {
    if (strategy === 'replace') {
      setPegawaiList(imported);
      showToast(`Pembaruan Sukses: Seluruh data sebelumnya (${pegawaiList.length} pegawai) telah DIGANTI dengan ${imported.length} data pegawai baru.`);
    } else if (strategy === 'upsert') {
      setPegawaiList(prev => {
        const map = new Map<string, Pegawai>();
        prev.forEach(p => map.set(p.nip || p.id, p));
        imported.forEach(p => map.set(p.nip || p.id, p));
        return Array.from(map.values());
      });
      showToast(`Sinkronisasi Sukses: ${imported.length} data pegawai berhasil diperbarui/ditambahkan.`);
    } else {
      setPegawaiList(prev => [...imported, ...prev]);
      showToast(`Berhasil menambahkan ${imported.length} data pegawai baru ke dalam SI-ITING.`);
    }
  };

  const handleResetDefaultData = () => {
    if (window.confirm('Kembalikan ke data master awal bawaan SI-ITING (Master Pegawai ASN)?')) {
      setPegawaiList(INITIAL_PEGAWAI);
      showToast('Master data kepegawaian berhasil dikembalikan ke contoh awal.');
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 animate-pulse shadow-lg mb-4">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div className="text-white font-black text-lg tracking-tight">SI-ITING</div>
        <div className="text-amber-300 text-xs italic mt-0.5 font-medium">“Data Tepat, Keputusan Tepat!”</div>
        <div className="text-slate-400 text-3xs mt-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span>Menghubungkan ke layanan autentikasi...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated and Not Guest -> Show Login Screen
  if (!currentUser && !isGuestMode) {
    return (
      <LoginScreen onContinueAsGuest={() => setIsGuestMode(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Optional Guest Notification Banner */}
      {!currentUser && isGuestMode && (
        <div className="no-print bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-amber-600 shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-slate-950 text-white text-3xs font-extrabold uppercase">Mode Tamu</span>
              <span className="hidden sm:inline">Anda sedang melihat data sebagai pengunjung pratinjau publik.</span>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded font-bold text-2xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Masuk Akun Dinas</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalPegawai={pegawaiList.length}
        onTambahPegawai={() => {
          setEditingPegawai(null);
          setIsFormModalOpen(true);
        }}
        onOpenTentangModal={() => setIsTentangModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenManajemenAkun={() => setIsManajemenAkunOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            pegawaiList={pegawaiList}
            onSelectPegawai={(p) => setSelectedPegawaiDetail(p)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'rekapitulasi' && (
          <RecapitulasiView
            pegawaiList={pegawaiList}
            onSelectPegawai={(p) => setSelectedPegawaiDetail(p)}
            onOpenCetakModal={(title, data) => {
              setPrintModalState({
                isOpen: true,
                title,
                data,
              });
            }}
          />
        )}

        {activeTab === 'pegawai' && (
          <DataPegawaiView
            pegawaiList={pegawaiList}
            onSelectPegawai={(p) => setSelectedPegawaiDetail(p)}
            onEditPegawai={(p) => {
              setEditingPegawai(p);
              setIsFormModalOpen(true);
            }}
            onDeletePegawai={handleDeletePegawai}
            onTambahPegawai={() => {
              setEditingPegawai(null);
              setIsFormModalOpen(true);
            }}
            onOpenImportModal={(strat: ImportStrategy = 'replace') => {
              setImportStrategy(strat);
              setIsImportModalOpen(true);
            }}
            onResetDefaultData={handleResetDefaultData}
            onOpenPanduanModal={() => setIsPanduanModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <DetailPegawaiModal
        pegawai={selectedPegawaiDetail}
        onClose={() => setSelectedPegawaiDetail(null)}
        onEdit={(p) => {
          setSelectedPegawaiDetail(null);
          setEditingPegawai(p);
          setIsFormModalOpen(true);
        }}
      />

      <FormPegawaiModal
        isOpen={isFormModalOpen}
        pegawai={editingPegawai}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPegawai(null);
        }}
        onSave={handleSavePegawai}
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        initialStrategy={importStrategy}
        currentCount={pegawaiList.length}
        onOpenPanduanModal={() => {
          setIsImportModalOpen(false);
          setIsPanduanModalOpen(true);
        }}
      />

      <PanduanExcelModal
        isOpen={isPanduanModalOpen}
        onClose={() => setIsPanduanModalOpen(false)}
        onOpenImportModal={() => {
          setIsPanduanModalOpen(false);
          setImportStrategy('replace');
          setIsImportModalOpen(true);
        }}
      />

      <CetakLaporanModal
        isOpen={printModalState.isOpen}
        title={printModalState.title}
        data={printModalState.data}
        onClose={() => setPrintModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <TentangAplikasiModal
        isOpen={isTentangModalOpen}
        onClose={() => setIsTentangModalOpen(false)}
      />

      {/* Login Modal for switching / logging in while in app */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => showToast('Berhasil masuk ke dalam akun.')}
      />

      {/* Super Admin Account Management Modal */}
      <ManajemenAkunModal
        isOpen={isManajemenAkunOpen}
        onClose={() => setIsManajemenAkunOpen(false)}
        onSuccessNotification={(msg) => showToast(msg)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-2xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className="text-slate-800 font-bold">SI-ITING</strong> &copy; {new Date().getFullYear()} · Sistem Informasi Bezetting — <span className="text-amber-600 font-semibold italic">“Data Tepat, Keputusan Tepat”</span>
          </span>
          <span className="text-slate-600 font-medium">
            Dikelola oleh Bagian Organisasi Sekretariat Daerah Kabupaten Bandung Barat
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

