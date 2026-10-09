import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Code2,
  Copy,
  Check,
  Zap,
  Play,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ColumnMapping, SheetFile, SyncLog } from '../types';
import {
  fetchSpreadsheetsFromDrive,
  fetchSpreadsheetMetadata,
  fetchSheetValues,
  autoDetectColumnMapping,
  parseRowsToMembers,
} from '../lib/sheetsService';
import { bulkImportMembers, recordSyncLog } from '../lib/firestoreService';

interface GoogleSheetsSyncProps {
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
  syncLogs: SyncLog[];
  totalMembersInFirestore: number;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  user,
  accessToken,
  onLogin,
  syncLogs,
  totalMembersInFirestore,
}) => {
  // Spreadsheet selection states
  const [spreadsheets, setSpreadsheets] = useState<SheetFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState('');
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [sheetTabs, setSheetTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('');

  // Row inspection & mapping
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    fullName: -1,
    cosplayName: -1,
    email: -1,
    phone: -1,
    discordUsername: -1,
    country: -1,
    province: -1,
    city: -1,
    ageCategory: -1,
    age: -1,
    primaryRole: -1,
    fandom: -1,
    experience: -1,
    socialMedia: -1,
    portfolioUrl: -1,
    reason: -1,
    timestamp: -1,
  });

  // Import states
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ completed: 0, total: 0 });
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live real-time transition poller
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [pollIntervalSeconds, setPollIntervalSeconds] = useState(30);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  // Fetch drive spreadsheets on token availability
  useEffect(() => {
    if (accessToken) {
      loadUserSpreadsheets();
    }
  }, [accessToken]);

  const loadUserSpreadsheets = async () => {
    if (!accessToken) return;
    setIsLoadingSheets(true);
    setErrorMsg(null);
    try {
      const files = await fetchSpreadsheetsFromDrive(accessToken);
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSpreadsheetId) {
        setSelectedSpreadsheetId(files[0].id);
      }
    } catch (err: unknown) {
      console.warn('Drive list info:', err);
      setErrorMsg('Gagal memuat daftar Google Sheet dari Drive. Pastikan izin akses telah diberikan.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Helper to extract sheet ID from raw ID or Docs URL
  const extractSheetId = (input: string): string => {
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    return trimmed;
  };

  // Fetch sheet tabs and preview rows
  const handleInspectSpreadsheet = async (sheetIdToInspect?: string) => {
    const targetId = extractSheetId(sheetIdToInspect || customSheetUrl || selectedSpreadsheetId);
    if (!targetId || !accessToken) {
      setErrorMsg('Silakan pilih atau masukkan ID/URL Google Sheet dan pastikan sudah login Google.');
      return;
    }

    setErrorMsg(null);
    setIsLoadingSheets(true);

    try {
      const meta = await fetchSpreadsheetMetadata(accessToken, targetId);
      const tabs = meta.sheets?.map((s: { properties: { title: string } }) => s.properties.title) || [];
      setSheetTabs(tabs);
      const activeTab = tabs[0] || 'Sheet1';
      setSelectedTab(activeTab);
      setSelectedSpreadsheetId(targetId);

      // Fetch first 10 rows for inspection
      const rawValues = await fetchSheetValues(accessToken, targetId, `${activeTab}!A1:Z10`);
      if (rawValues && rawValues.length > 0) {
        const detectedHeaders = rawValues[0] || [];
        setHeaders(detectedHeaders);
        setPreviewRows(rawValues.slice(1));
        const autoMap = autoDetectColumnMapping(detectedHeaders);
        setColumnMapping(autoMap);
      } else {
        setErrorMsg('Spreadsheet ini masih kosong atau belum memiliki data respon.');
      }
    } catch (err: unknown) {
      console.error('Inspect error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengakses data spreadsheet.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Run bulk import into Firestore
  const handleImportToFirebase = async () => {
    const targetId = selectedSpreadsheetId || extractSheetId(customSheetUrl);
    if (!targetId || !accessToken) {
      setErrorMsg('Pilih spreadsheet terlebih dahulu.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);
    setImportResult(null);

    try {
      // Fetch all rows
      const allRows = await fetchSheetValues(accessToken, targetId, `${selectedTab || 'Sheet1'}!A1:Z2000`);
      if (allRows.length <= 1) {
        throw new Error('Tidak ada baris data respon baru untuk diimpor.');
      }

      const membersToImport = parseRowsToMembers(
        allRows,
        columnMapping,
        totalMembersInFirestore,
        'spreadsheet_import'
      );

      if (membersToImport.length === 0) {
        throw new Error('Tidak ada baris valid yang ditemukan berdasarkan pemetaan kolom.');
      }

      setImportProgress({ completed: 0, total: membersToImport.length });

      const result = await bulkImportMembers(membersToImport, (completed, total) => {
        setImportProgress({ completed, total });
      });

      setImportResult(result);

      // Record sync log in Firestore
      await recordSyncLog({
        spreadsheetId: targetId,
        importedCount: result.added,
        source: 'Google Sheets Importer',
        syncedAt: new Date().toISOString(),
        details: `Berhasil import ${result.added} anggota baru, ${result.skipped} duplikat dilewati.`,
      });
    } catch (err: unknown) {
      console.error('Import error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal melakukan impor ke Firebase.');
    } finally {
      setIsImporting(false);
    }
  };

  // Real-Time Poller effect for live transition
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoSyncActive && accessToken && selectedSpreadsheetId) {
      interval = setInterval(async () => {
        try {
          const rawValues = await fetchSheetValues(
            accessToken,
            selectedSpreadsheetId,
            `${selectedTab || 'Sheet1'}!A1:Z2000`
          );

          if (rawValues.length > 1) {
            const parsed = parseRowsToMembers(
              rawValues,
              columnMapping,
              totalMembersInFirestore,
              'google_form_sync'
            );

            const res = await bulkImportMembers(parsed);
            if (res.added > 0) {
              await recordSyncLog({
                spreadsheetId: selectedSpreadsheetId,
                importedCount: res.added,
                source: 'Real-Time Transition Poller',
                syncedAt: new Date().toISOString(),
                details: `Otomatis menambah ${res.added} respon Google Form baru ke Firebase.`,
              });
            }
          }
          setLastPollTime(new Date());
        } catch (e) {
          console.warn('Auto poll error:', e);
        }
      }, pollIntervalSeconds * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSyncActive, accessToken, selectedSpreadsheetId, selectedTab, columnMapping, totalMembersInFirestore, pollIntervalSeconds]);

  // Google Apps Script snippet generator
  const webhookUrl = `${window.location.origin}/api/sync-form`;
  const appsScriptCode = `/**
 * KAWANCOSPLAY GOOGLE FORM REAL-TIME SYNC BRIDGE
 * Pasang di: Google Sheet Tanggapan -> Ekstensi -> Apps Script
 * Pemicu (Trigger): onFormSubmit -> Saat Mengirim Formulir
 */
function onFormSubmit(e) {
  var targetUrl = "${webhookUrl}";
  
  // Ambil data respon form
  var responseData = e ? (e.namedValues || e.values) : {};
  
  var payload = {
    source: "google_form_instant_trigger",
    timestamp: new Date().toISOString(),
    data: responseData
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var res = UrlFetchApp.fetch(targetUrl, options);
    Logger.log("KawanCosplay Sync Result: " + res.getContentText());
  } catch (err) {
    Logger.log("Sync Error: " + err.toString());
  }
}
`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Title & Introduction */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Sheets & Form Real-Time Bridge</span>
          </span>
          <span className="text-xs text-slate-400">Transisi Google Form ke Firebase</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Sinkronisasi Database Spreadsheet & Google Form
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-1">
          Impor database spreadsheet anggota lama yang sudah ada dan aktifkan sinkronisasi real-time sehingga setiap kali ada anggota baru mengisi Google Form selama masa transisi, data otomatis masuk ke Firebase.
        </p>
      </div>

      {/* Auth Alert if token is not ready */}
      {!accessToken && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Koneksi Google Sheets & Drive Diperlukan
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Untuk membaca spreadsheet Google Form Anda secara langsung, masuk menggunakan akun Google yang memiliki akses ke spreadsheet respon pendaftaran KawanCosplay.
              </p>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center space-x-2 shrink-0 transition-transform active:scale-95"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Hubungkan Google Sheets</span>
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SPREADSHEET PICKER & COLUMN MAPPER (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: PILIH SPREADSHEET */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Pilih File Spreadsheet Google Form</h2>
                <p className="text-xs text-slate-400">Pilih dari Drive kamu atau tempel link URL Spreadsheet</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Drive file dropdown if available */}
              {spreadsheets.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Spreadsheet dari Google Drive Kamu
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSpreadsheetId}
                      onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {spreadsheets.map((file) => (
                        <option key={file.id} value={file.id}>
                          📄 {file.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleInspectSpreadsheet(selectedSpreadsheetId)}
                      disabled={isLoadingSheets}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingSheets ? 'animate-spin' : ''}`} />
                      <span>Muat Kolom</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Or manual URL / ID Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Atau Tempelkan URL / ID Google Spreadsheet
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit atau ID"
                    value={customSheetUrl}
                    onChange={(e) => setCustomSheetUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectSpreadsheet()}
                    disabled={isLoadingSheets || (!customSheetUrl && !selectedSpreadsheetId)}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 disabled:opacity-50"
                  >
                    <span>Periksa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
                </p>
              </div>

              {/* Sheet tabs selector if multiple sheets */}
              {sheetTabs.length > 1 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Pilih Tab Lembar Kerja (Sheet Tab)
                  </label>
                  <select
                    value={selectedTab}
                    onChange={(e) => {
                      setSelectedTab(e.target.value);
                      handleInspectSpreadsheet(selectedSpreadsheetId);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  >
                    {sheetTabs.map((tab) => (
                      <option key={tab} value={tab}>
                        {tab}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: AUTO COLUMN MAPPING PREVIEW */}
          {headers.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Pemetaan Kolom Respon (Mapping)</h2>
                    <p className="text-xs text-slate-400">
                      Sistem telah mendeteksi {headers.length} kolom dari form Google kamu
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
                  Auto-Detected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.fullName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, fullName: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Pilih Kolom --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cosplay Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Cosname / Alias <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.cosplayName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, cosplayName: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Pilih Kolom --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Email <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.email}
                    onChange={(e) => setColumnMapping({ ...columnMapping, email: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Pilih Kolom --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom WhatsApp / No HP <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.phone}
                    onChange={(e) => setColumnMapping({ ...columnMapping, phone: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Tidak Ada / Kosong --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Username Discord */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Username Discord
                  </label>
                  <select
                    value={columnMapping.discordUsername}
                    onChange={(e) => setColumnMapping({ ...columnMapping, discordUsername: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Tidak Ada / Kosong --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Domisili / Kota */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Kota / Domisili
                  </label>
                  <select
                    value={columnMapping.city}
                    onChange={(e) => setColumnMapping({ ...columnMapping, city: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Default (Indonesia) --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Peran / Role */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Peran / Minat (Cosplayer/Crafter/dll)
                  </label>
                  <select
                    value={columnMapping.primaryRole}
                    onChange={(e) => setColumnMapping({ ...columnMapping, primaryRole: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Default (Cosplayer) --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fandom */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Fandom / Karakter Favorit
                  </label>
                  <select
                    value={columnMapping.fandom}
                    onChange={(e) => setColumnMapping({ ...columnMapping, fandom: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Default (Anime & Games) --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timestamp */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom Timestamp Respon
                  </label>
                  <select
                    value={columnMapping.timestamp}
                    onChange={(e) => setColumnMapping({ ...columnMapping, timestamp: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={-1}>-- Waktu Saat Ini --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview of first 3 rows including Discord Username & WhatsApp */}
              {previewRows.length > 0 && (
                <div className="mb-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-2">
                    Pratinjau Data Spreadsheet (Nama, WhatsApp & Discord Username):
                  </p>
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-1.5 pr-3">Nama / Cosname</th>
                        <th className="py-1.5 px-3">WhatsApp</th>
                        <th className="py-1.5 px-3">Discord Username</th>
                        <th className="py-1.5 pl-3">Domisili</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {previewRows.slice(0, 4).map((r, idx) => {
                        const nameVal =
                          (columnMapping.cosplayName >= 0 ? r[columnMapping.cosplayName] : '') ||
                          (columnMapping.fullName >= 0 ? r[columnMapping.fullName] : '') ||
                          '-';
                        const waVal = columnMapping.phone >= 0 ? r[columnMapping.phone] || '-' : '-';
                        const dcVal =
                          columnMapping.discordUsername >= 0 ? r[columnMapping.discordUsername] || '-' : '-';
                        const cityVal = columnMapping.city >= 0 ? r[columnMapping.city] || '-' : '-';
                        return (
                          <tr key={idx}>
                            <td className="py-1.5 pr-3 font-semibold text-white">{nameVal}</td>
                            <td className="py-1.5 px-3 font-mono text-emerald-400">{waVal}</td>
                            <td className="py-1.5 px-3 font-mono text-indigo-300">{dcVal}</td>
                            <td className="py-1.5 pl-3 text-slate-400">{cityVal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ACTION: IMPORT NOW */}
              <button
                type="button"
                onClick={handleImportToFirebase}
                disabled={isImporting}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      Mengimpor ke Firestore ({importProgress.completed}/{importProgress.total})...
                    </span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Impor Seluruh Respon Spreadsheet (Termasuk Discord & WA) ke Firebase</span>
                  </>
                )}
              </button>

              {/* Result banner */}
              {importResult && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      Berhasil mengimpor <strong>{importResult.added} anggota baru</strong>! ({importResult.skipped} duplikat dilewati).
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME TRANSITION ENGINE & APPS SCRIPT (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* REAL-TIME LIVE POLLER */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="flex h-3 w-3 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      isAutoSyncActive ? 'bg-emerald-400 opacity-75' : 'bg-slate-600'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isAutoSyncActive ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  ></span>
                </span>
                <h3 className="font-bold text-white text-base">Real-Time Transition Poller</h3>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAutoSyncActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isAutoSyncActive ? 'Aktif (Live)' : 'Nonaktif'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ketika fitur ini aktif, aplikasi akan memeriksa spreadsheet setiap {pollIntervalSeconds} detik. Setiap ada respon Google Form baru yang masuk, anggota otomatis ditambahkan ke Firebase dan KCC ID langsung diterbitkan.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Interval Pemeriksaan:</span>
                <select
                  value={pollIntervalSeconds}
                  onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs"
                >
                  <option value={15}>Setiap 15 detik</option>
                  <option value={30}>Setiap 30 detik (Optimal)</option>
                  <option value={60}>Setiap 60 detik</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pemeriksaan Terakhir:</span>
                <span className="font-mono text-slate-200">
                  {lastPollTime ? lastPollTime.toLocaleTimeString('id-ID') : 'Belum dijalankan'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!selectedSpreadsheetId && !customSheetUrl) {
                  setErrorMsg('Pilih file spreadsheet terlebih dahulu pada Langkah 1.');
                  return;
                }
                setIsAutoSyncActive(!isAutoSyncActive);
              }}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                isAutoSyncActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              {isAutoSyncActive ? (
                <span>Hentikan Live Poller</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Real-Time Auto Sync</span>
                </>
              )}
            </button>
          </div>

          {/* GOOGLE APPS SCRIPT WEBHOOK TRIGGER OPTION */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center space-x-2 mb-3">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Google Apps Script Webhook</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ingin respon Google Form langsung terkirim seketika saat tombol <em>Submit</em> ditekan tanpa perlu menunggu interval polling? Pasang script ini di Google Sheet responmu:
            </p>

            {/* Code Box */}
            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 mb-4">
              <button
                onClick={copyScriptToClipboard}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans flex items-center space-x-1 border border-slate-700 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Script</span>
                  </>
                )}
              </button>
              <pre className="text-slate-400">{appsScriptCode}</pre>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-white">Langkah Pasang Cepat (1 Menit):</p>
              <p>1. Buka Google Sheet responmu &gt; Menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</p>
              <p>2. Paste kode di atas &gt; Simpan.</p>
              <p>3. Di menu kiri klik <strong>Pemicu (Triggers)</strong> &gt; Tambah Pemicu &gt; Pilih acara: <em>Saat mengirim formulir</em>.</p>
            </div>
          </div>

          {/* RECENT SYNC LOGS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-sm">Riwayat Sinkronisasi Terbaru</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">{syncLogs.length} Log</span>
            </div>

            {syncLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">
                Belum ada aktivitas sinkronisasi yang tercatat.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-400">{log.source}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.syncedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{log.details || `Impor ${log.importedCount} baris`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
