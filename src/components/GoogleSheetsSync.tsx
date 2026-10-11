import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Key,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  ColumnMapping,
  SyncLog,
  BulkImportResult,
  SubscriptionErrorKind,
} from '../types';
import {
  fetchSpreadsheetMetadata,
  fetchSheetValues,
  autoDetectColumnMapping,
  parseRowsToMembers,
  parseSpreadsheetId,
  sheetRange,
  classifySheetsError,
} from '../lib/sheetsService';
import { bulkImportMembers, recordSyncLog } from '../lib/firestoreService';
import { describeFirestoreError } from '../lib/firebase';
import type { LanguageCode } from '../lib/i18n';

interface GoogleSheetsSyncProps {
  user: User | null;
  accessToken: string | null;
  // On-demand Sheets authorization (read-only Sheets scope, same Google account) owned by
  // App.handleConnectSheets, not the regular AuthModal login. App stores the new token and sets
  // connectError; this component never signs in by itself.
  onLogin: () => void | Promise<void>;
  connectError?: string | null;
  syncLogs: SyncLog[];
  syncLogsError?: SubscriptionErrorKind | null;
  totalMembersInFirestore: number;
  // UI language of the copy this component switches by language (defaults to Indonesian)
  currentLang?: LanguageCode;
}

// Last spreadsheet inspected successfully in this browser (per-browser convenience only)
const LAST_SPREADSHEET_ID_KEY = 'kcc_sheets_last_spreadsheet_id';

function readLastSpreadsheetId(): string {
  try {
    if (typeof window === 'undefined') return '';
    const stored = window.localStorage.getItem(LAST_SPREADSHEET_ID_KEY) || '';
    return parseSpreadsheetId(stored) ? stored : '';
  } catch {
    // Storage blocked (privacy mode / sandboxed iframe)
    return '';
  }
}

function writeLastSpreadsheetId(spreadsheetId: string): void {
  try {
    window.localStorage.setItem(LAST_SPREADSHEET_ID_KEY, spreadsheetId);
  } catch {
    // Storage blocked / quota exceeded: only the convenience default is lost
  }
}

/**
 * Friendly bilingual message for a failed Google Sheets API call (classifySheetsError != null).
 */
function describeSheetsError(error: unknown, isId: boolean, accountEmail: string | null | undefined): string {
  const account = accountEmail || (isId ? 'akun admin' : 'the admin account');
  switch (classifySheetsError(error)) {
    case 'unauthorized':
      return isId
        ? 'Izin Google Sheets sudah kedaluwarsa atau tidak berlaku lagi. Klik "Hubungkan Google Sheets" untuk memperbaruinya, lalu coba lagi.'
        : 'The Google Sheets permission expired or is no longer valid. Click "Connect Google Sheets" to renew it, then try again.';
    case 'scope':
      return isId
        ? 'Izin baca Google Sheets belum diberikan. Klik "Hubungkan Google Sheets" dan centang izin untuk melihat spreadsheet Google Sheets Anda.'
        : 'Read access to Google Sheets was not granted. Click "Connect Google Sheets" and tick the permission to see your Google Sheets spreadsheets.';
    case 'no-access':
    case 'not-found':
      return isId
        ? `Akun Google yang sedang masuk (${account}) tidak memiliki akses ke spreadsheet ini, atau ID spreadsheet salah. Bagikan (Share) spreadsheet ke akun admin tersebut — akses Viewer sudah cukup — atau periksa kembali URL/ID-nya.`
        : `The signed-in Google account (${account}) has no access to this spreadsheet, or the spreadsheet ID is wrong. Share the spreadsheet with that admin account (Viewer access is enough), or double-check the URL/ID.`;
    case 'unsupported-file':
      return isId
        ? 'File ini bukan Google Sheets asli (misalnya file Excel .xlsx yang diunggah). Buka file tersebut lalu pilih File > Simpan sebagai Google Spreadsheet, kemudian pakai URL file barunya.'
        : 'This file is not a native Google Sheets file (e.g. an uploaded Excel .xlsx). Open it, choose File > Save as Google Sheets, then use the new file URL.';
    case 'rate-limit':
      return isId
        ? 'Batas permintaan Google Sheets API tercapai. Tunggu sekitar satu menit lalu coba lagi.'
        : 'The Google Sheets API request limit was reached. Wait about a minute, then try again.';
    case 'network':
      return isId
        ? 'Tidak dapat menghubungi Google Sheets. Periksa koneksi internet Anda lalu coba lagi.'
        : 'Could not reach Google Sheets. Check your internet connection, then try again.';
    default: {
      const detail = error instanceof Error ? error.message : String(error);
      return isId ? `Google Sheets menolak permintaan: ${detail}` : `Google Sheets rejected the request: ${detail}`;
    }
  }
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  user,
  accessToken,
  onLogin,
  connectError = null,
  syncLogs,
  syncLogsError = null,
  totalMembersInFirestore,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  // Spreadsheet selection states. The Drive file list is gone (it needs a Drive scope): the admin pastes
  // a spreadsheet URL or ID, prefilled with the last one used in this browser or the latest sync log's.
  const [sheetInput, setSheetInput] = useState<string>(() => readLastSpreadsheetId());
  const sheetInputTouchedRef = useRef(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  // Spreadsheet that was inspected successfully: the import and the poller read this one
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState('');
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('');
  const [sheetTabs, setSheetTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('');

  // Row inspection & mapping
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: -1,
    fullName: -1,
    cosplayName: -1,
    email: -1,
    phone: -1,
    phone2: -1,
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
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live real-time transition poller
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [pollIntervalSeconds, setPollIntervalSeconds] = useState(30);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  // Prevents overlapping poller runs (a slow import must finish before the next poll starts)
  const pollInFlightRef = useRef(false);
  // Sheet / tab / mapping + raw values of the last fully imported poll: while the sheet is unchanged the
  // poller skips Firestore entirely (no full members read and no writes every interval)
  const lastPollSignatureRef = useRef<string | null>(null);

  // Most recent sync log's spreadsheet (syncLogs are ordered newest first)
  const latestLoggedSpreadsheetId = useMemo(() => {
    for (const log of syncLogs) {
      const id = parseSpreadsheetId(log.spreadsheetId || '');
      if (id) return id;
    }
    return null;
  }, [syncLogs]);

  // Default the input to the latest synced spreadsheet when this browser has no remembered one
  // (sync logs arrive asynchronously; never overwrite what the admin typed)
  useEffect(() => {
    if (sheetInputTouchedRef.current || !latestLoggedSpreadsheetId) return;
    setSheetInput((prev) => (prev.trim() ? prev : latestLoggedSpreadsheetId));
  }, [latestLoggedSpreadsheetId]);

  // A new Sheets token replaces the one an earlier error was about
  useEffect(() => {
    if (accessToken) setErrorMsg(null);
  }, [accessToken]);

  const parsedInputId = parseSpreadsheetId(sheetInput);

  const handleSheetInputChange = (value: string) => {
    sheetInputTouchedRef.current = true;
    setSheetInput(value);
  };

  // Single authorization flow: App.handleConnectSheets (googleSignIn, read-only Sheets scope requested on
  // demand for the signed-in account) stores the token and reports errors through connectError.
  const handleAuthorizeGoogle = async () => {
    setIsLoadingSheets(true);
    setErrorMsg(null);
    try {
      await onLogin();
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Fetch sheet tabs and preview rows. `preferredTab` keeps the chosen tab when switching tabs.
  const handleInspectSpreadsheet = async (rawInput?: string, preferredTab?: string) => {
    const input = rawInput ?? sheetInput;
    const targetId = parseSpreadsheetId(input);
    if (!targetId) {
      setErrorMsg(
        input.trim()
          ? isId
            ? 'URL atau ID spreadsheet tidak valid. Tempel URL lengkap Google Sheets (https://docs.google.com/spreadsheets/d/…/edit) atau ID-nya saja.'
            : 'Invalid spreadsheet URL or ID. Paste the full Google Sheets URL (https://docs.google.com/spreadsheets/d/…/edit) or just its ID.'
          : isId
          ? 'Masukkan URL atau ID Google Sheets terlebih dahulu.'
          : 'Enter a Google Sheets URL or ID first.'
      );
      return;
    }
    if (!accessToken) {
      setErrorMsg(
        isId
          ? 'Izin Google Sheets belum diberikan. Klik "Hubungkan Google Sheets" terlebih dahulu.'
          : 'Google Sheets access has not been granted yet. Click "Connect Google Sheets" first.'
      );
      return;
    }

    setErrorMsg(null);
    setIsLoadingSheets(true);

    try {
      const meta = await fetchSpreadsheetMetadata(accessToken, targetId);
      const tabs = (meta.sheets || []).map((s) => s.properties.title).filter((title) => !!title);
      const activeTab = preferredTab && tabs.includes(preferredTab) ? preferredTab : tabs[0] || 'Sheet1';
      setSheetTabs(tabs);
      setSelectedTab(activeTab);
      setSelectedSpreadsheetId(targetId);
      setSpreadsheetTitle(meta.properties?.title || '');
      // Readable with this account: remember it for the next visit
      writeLastSpreadsheetId(targetId);

      // Fetch first 10 rows for inspection
      const rawValues = await fetchSheetValues(accessToken, targetId, sheetRange(activeTab, 'A1:Z10'));
      if (rawValues && rawValues.length > 0) {
        const detectedHeaders = rawValues[0] || [];
        setHeaders(detectedHeaders);
        setPreviewRows(rawValues.slice(1));
        const autoMap = autoDetectColumnMapping(detectedHeaders);
        setColumnMapping(autoMap);
      } else {
        // Never keep another sheet's columns / mapping for this one
        setHeaders([]);
        setPreviewRows([]);
        setErrorMsg(
          isId
            ? 'Spreadsheet ini masih kosong atau belum memiliki data respon.'
            : 'This spreadsheet is empty or has no responses yet.'
        );
      }
    } catch (err: unknown) {
      console.error('Inspect error:', err);
      setErrorMsg(
        classifySheetsError(err)
          ? describeSheetsError(err, isId, user?.email)
          : err instanceof Error
          ? err.message
          : isId
          ? 'Gagal mengakses data spreadsheet.'
          : 'Could not read the spreadsheet.'
      );
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Run bulk import into Firestore
  const handleImportToFirebase = async () => {
    const targetId = selectedSpreadsheetId;
    if (!targetId || !accessToken) {
      setErrorMsg(
        isId
          ? 'Hubungkan Google Sheets lalu periksa spreadsheet terlebih dahulu (Langkah 1).'
          : 'Connect Google Sheets and inspect a spreadsheet first (Step 1).'
      );
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);
    setImportResult(null);

    try {
      // Fetch all rows
      const allRows = await fetchSheetValues(accessToken, targetId, sheetRange(selectedTab, 'A1:Z2000'));
      if (allRows.length <= 1) {
        throw new Error(
          isId ? 'Tidak ada baris data respon baru untuk diimpor.' : 'There are no response rows to import.'
        );
      }

      const membersToImport = parseRowsToMembers(
        allRows,
        columnMapping,
        totalMembersInFirestore,
        'spreadsheet_import'
      );

      if (membersToImport.length === 0) {
        throw new Error(
          isId
            ? 'Tidak ada baris valid yang ditemukan berdasarkan pemetaan kolom.'
            : 'No valid rows were found with this column mapping.'
        );
      }

      setImportProgress({ completed: 0, total: membersToImport.length });

      // Throws if the existing members cannot be read (never imports against an empty list).
      const result = await bulkImportMembers(membersToImport, (completed, total) => {
        setImportProgress({ completed, total });
      });

      setImportResult(result);

      // Record sync log in Firestore (a failed log write must not hide a successful import)
      try {
        await recordSyncLog({
          spreadsheetId: targetId,
          importedCount: result.added,
          source: 'Google Sheets Importer',
          syncedAt: new Date().toISOString(),
          details: `Impor selesai: ${result.added} anggota baru, ${result.updated} diperbarui, ${result.unchanged} tidak berubah, ${result.skipped} gagal.`,
        });
      } catch (logErr) {
        console.warn('Sync log write failed:', logErr);
      }
    } catch (err: unknown) {
      console.error('Import error:', err);
      setErrorMsg(
        classifySheetsError(err) ? describeSheetsError(err, isId, user?.email) : describeFirestoreError(err, isId)
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Real-Time Poller effect for live transition
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoSyncActive && accessToken && selectedSpreadsheetId) {
      interval = setInterval(async () => {
        if (pollInFlightRef.current) return;
        pollInFlightRef.current = true;
        try {
          const rawValues = await fetchSheetValues(
            accessToken,
            selectedSpreadsheetId,
            sheetRange(selectedTab, 'A1:Z2000')
          );

          const signature = `${selectedSpreadsheetId}|${selectedTab}|${JSON.stringify(columnMapping)}|${JSON.stringify(rawValues)}`;

          if (rawValues.length > 1 && signature !== lastPollSignatureRef.current) {
            const parsed = parseRowsToMembers(
              rawValues,
              columnMapping,
              totalMembersInFirestore,
              'google_form_sync'
            );

            // Unchanged rows are skipped by the data layer (no rewrite every poll).
            const res = await bulkImportMembers(parsed);
            if (res.added > 0 || res.updated > 0) {
              await recordSyncLog({
                spreadsheetId: selectedSpreadsheetId,
                importedCount: res.added,
                source: 'Real-Time Transition Poller',
                syncedAt: new Date().toISOString(),
                details: `Otomatis: ${res.added} baru, ${res.updated} diperbarui.`,
              });
            }
            // Rows that failed are retried on the next poll; a clean run is not repeated until the sheet changes
            lastPollSignatureRef.current = res.skipped === 0 ? signature : null;
          }
          setLastPollTime(new Date());
        } catch (e) {
          console.warn('Auto poll error:', e);
          // Stop the poller so a failing sync does not keep retrying writes every interval
          // (an expired Sheets token ends up here too: the message asks to reconnect).
          setErrorMsg(
            classifySheetsError(e) ? describeSheetsError(e, isId, user?.email) : describeFirestoreError(e, isId)
          );
          setIsAutoSyncActive(false);
        } finally {
          pollInFlightRef.current = false;
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Sinkronisasi Database Spreadsheet & Google Form
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-1">
              Impor database spreadsheet anggota lama yang sudah ada dan aktifkan sinkronisasi real-time sehingga setiap kali ada anggota baru mengisi Google Form selama masa transisi, data otomatis masuk ke Firebase.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAuthorizeGoogle}
              disabled={isLoadingSheets}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <span>
                {accessToken
                  ? isId
                    ? 'Perbarui Izin Google Sheets'
                    : 'Renew Google Sheets Access'
                  : isId
                  ? 'Hubungkan Google Sheets'
                  : 'Connect Google Sheets'}
              </span>
            </button>
          </div>
        </div>
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
                {isId ? 'Koneksi Google Sheets Diperlukan' : 'Google Sheets Connection Required'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                {isId
                  ? 'Untuk membaca spreadsheet Google Form secara langsung, beri MyKCC izin baca Google Sheets untuk akun Google admin yang sedang masuk. Akun tersebut harus memiliki akses ke spreadsheet pendaftaran KawanCosplay.'
                  : 'To read the Google Form spreadsheet directly, give MyKCC read access to Google Sheets for the signed-in admin Google account. That account must have access to the KawanCosplay registration spreadsheet.'}
              </p>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-xl mt-2">
                {isId
                  ? `Izin diminta untuk akun yang sedang masuk${user?.email ? ` (${user.email})` : ''}. MyKCC hanya meminta akses baca Google Sheets, tanpa akses Google Drive.`
                  : `Access is requested for the signed-in account${user?.email ? ` (${user.email})` : ''}. MyKCC only asks for read access to Google Sheets, no Google Drive access.`}
              </p>
              {connectError && (
                <p className="text-xs text-rose-300 font-semibold leading-relaxed max-w-xl mt-2 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-px" />
                  <span>{connectError}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAuthorizeGoogle}
            disabled={isLoadingSheets}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center space-x-2 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>{isId ? 'Hubungkan Google Sheets' : 'Connect Google Sheets'}</span>
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SPREADSHEET PICKER & COLUMN MAPPER (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: PILIH SPREADSHEET */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {isId ? 'Spreadsheet Google Form' : 'Google Form Spreadsheet'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isId
                      ? 'Tempel URL atau ID spreadsheet respon Google Form.'
                      : 'Paste the URL or ID of the Google Form responses spreadsheet.'}
                  </p>
                </div>
              </div>
            </div>

            {accessToken && connectError && (
              <p className="mb-4 text-xs text-rose-300 font-semibold flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-px" />
                <span>{connectError}</span>
              </p>
            )}

            <div className="space-y-4">
              {/* Spreadsheet URL / ID (Drive listing removed: it needs a Drive scope; only spreadsheets.readonly is requested) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {isId ? 'URL / ID Google Spreadsheet' : 'Google Spreadsheet URL / ID'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    placeholder={
                      isId
                        ? 'https://docs.google.com/spreadsheets/d/…/edit atau ID'
                        : 'https://docs.google.com/spreadsheets/d/…/edit or ID'
                    }
                    value={sheetInput}
                    onChange={(e) => handleSheetInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInspectSpreadsheet();
                      }
                    }}
                    className="flex-1 min-w-0 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectSpreadsheet()}
                    disabled={isLoadingSheets || !sheetInput.trim()}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 disabled:opacity-50"
                  >
                    <span>Periksa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
                  {sheetInput.trim() && !parsedInputId && (
                    <span className="block text-rose-300 mt-1">
                      {isId ? 'URL / ID belum dikenali.' : 'URL / ID not recognised yet.'}
                    </span>
                  )}
                  {spreadsheetTitle && selectedSpreadsheetId && (
                    <span className="block text-emerald-300 mt-1">📄 {spreadsheetTitle}</span>
                  )}
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
                      handleInspectSpreadsheet(selectedSpreadsheetId, e.target.value);
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

                {/* WhatsApp Cadangan / No WA 2 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kolom WhatsApp Cadangan / No WA 2 <span className="text-slate-500 font-normal">(Opsional)</span>
                  </label>
                  <select
                    value={columnMapping.phone2 ?? -1}
                    onChange={(e) => setColumnMapping({ ...columnMapping, phone2: Number(e.target.value) })}
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
                        const cosIdx = columnMapping.name >= 0 ? columnMapping.name : (columnMapping.cosplayName ?? -1);
                        const nameVal =
                          (cosIdx >= 0 ? r[cosIdx] : '') ||
                          (columnMapping.fullName >= 0 ? r[columnMapping.fullName] : '') ||
                          '-';
                        const waVal = columnMapping.phone >= 0 ? r[columnMapping.phone] || '-' : '-';
                        const wa2Val = columnMapping.phone2 !== undefined && columnMapping.phone2 >= 0 ? r[columnMapping.phone2] : '';
                        const dcVal =
                          columnMapping.discordUsername >= 0 ? r[columnMapping.discordUsername] || '-' : '-';
                        const cityVal = columnMapping.city >= 0 ? r[columnMapping.city] || '-' : '-';
                        return (
                          <tr key={idx}>
                            <td className="py-1.5 pr-3 font-semibold text-white">{nameVal}</td>
                            <td className="py-1.5 px-3 font-mono text-emerald-400">
                              <span>{waVal}</span>
                              {wa2Val && <span className="block text-[10px] text-emerald-300/80">No 2: {wa2Val}</span>}
                            </td>
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
                      Impor selesai: <strong>{importResult.added} anggota baru</strong>, {importResult.updated} diperbarui,{' '}
                      {importResult.unchanged} tidak berubah, {importResult.skipped} gagal.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-100">{errorMsg}</p>
                  <p className="text-[11px] text-rose-300/80 mt-1">
                    Tips: Anda juga bisa langsung menempelkan URL Spreadsheet Google Form di kolom input atas lalu klik &quot;Periksa&quot;.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAuthorizeGoogle}
                disabled={isLoadingSheets}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shrink-0 flex items-center space-x-2 shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Beri Izin / Hubungkan Google</span>
              </button>
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
                if (!isAutoSyncActive && !selectedSpreadsheetId) {
                  setErrorMsg(
                    isId
                      ? 'Periksa spreadsheet terlebih dahulu pada Langkah 1.'
                      : 'Check a spreadsheet first in Step 1.'
                  );
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

            {syncLogsError === 'permission-denied' ? (
              <p className="text-xs text-rose-300 font-semibold py-3 text-center">
                Akses log sinkronisasi ditolak — masuk dengan akun Google admin.
              </p>
            ) : syncLogsError ? (
              <p className="text-xs text-amber-300 py-3 text-center">
                Gagal memuat riwayat sinkronisasi. Periksa koneksi lalu muat ulang halaman.
              </p>
            ) : syncLogs.length === 0 ? (
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
