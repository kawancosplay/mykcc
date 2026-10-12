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
import { useI18n } from '../i18n';
import type { LanguageCode, TranslateFn, TranslationKey } from '../i18n';

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
  // Kept for callers that still pass it; the UI language comes from useI18n()
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
 * Friendly message for a failed Google Sheets API call (classifySheetsError != null).
 */
function describeSheetsError(error: unknown, t: TranslateFn, accountEmail: string | null | undefined): string {
  const account = accountEmail || t('sheets.adminAccountFallback');
  switch (classifySheetsError(error)) {
    case 'unauthorized':
      return t('sheets.errorUnauthorized');
    case 'scope':
      return t('sheets.errorScope');
    case 'no-access':
    case 'not-found':
      return t('sheets.errorNoAccess', { account });
    case 'unsupported-file':
      return t('sheets.errorUnsupportedFile');
    case 'rate-limit':
      return t('sheets.errorRateLimit');
    case 'network':
      return t('sheets.errorNetwork');
    default: {
      const detail = error instanceof Error ? error.message : String(error);
      return t('sheets.errorRejected', { detail });
    }
  }
}

/**
 * Renders the <strong>…</strong> / <em>…</em> markers of a translation as bold / italic text
 * (plain React nodes, never HTML injection).
 */
function renderMarkedText(text: string): React.ReactNode[] {
  return text.split(/(<strong>[\s\S]*?<\/strong>|<em>[\s\S]*?<\/em>)/g).map((part, i) => {
    const strong = part.match(/^<strong>([\s\S]*)<\/strong>$/);
    if (strong) return <strong key={i}>{strong[1]}</strong>;
    const em = part.match(/^<em>([\s\S]*)<\/em>$/);
    if (em) return <em key={i}>{em[1]}</em>;
    return part;
  });
}

// Sync log `source` values stored in Firestore (data: never translated) and their display labels
const SYNC_SOURCE_IMPORTER = 'Google Sheets Importer';
const SYNC_SOURCE_POLLER = 'Real-Time Transition Poller';
const SYNC_SOURCE_LABEL_KEYS = new Map<string, TranslationKey>([
  [SYNC_SOURCE_IMPORTER, 'sheets.logSourceImporter'],
  [SYNC_SOURCE_POLLER, 'sheets.pollerTitle'],
]);

// Sync log `details` are stored as Indonesian text (data, format kept unchanged for existing logs).
// The two formats written here are parsed back and shown in the selected language.
const IMPORT_LOG_DETAILS_PATTERN = /^Impor selesai: (\d+) anggota baru, (\d+) diperbarui, (\d+) tidak berubah, (\d+) gagal\.$/;
const AUTO_LOG_DETAILS_PATTERN = /^Otomatis: (\d+) baru, (\d+) diperbarui\.$/;

function importLogDetails(result: BulkImportResult): string {
  return `Impor selesai: ${result.added} anggota baru, ${result.updated} diperbarui, ${result.unchanged} tidak berubah, ${result.skipped} gagal.`;
}

function autoSyncLogDetails(result: BulkImportResult): string {
  return `Otomatis: ${result.added} baru, ${result.updated} diperbarui.`;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  user,
  accessToken,
  onLogin,
  connectError = null,
  syncLogs,
  syncLogsError = null,
  totalMembersInFirestore,
}) => {
  const { t, formatNumber, formatDate } = useI18n();

  // Display label of a stored sync log source (unknown sources are shown as stored)
  const describeLogSource = (source: string): string => {
    const key = SYNC_SOURCE_LABEL_KEYS.get(source);
    return key ? t(key) : source;
  };

  // Display text of a stored sync log summary (unknown formats are shown as stored)
  const describeLogDetails = (log: SyncLog): string => {
    if (!log.details) return t('sheets.logImportedRows', { count: formatNumber(log.importedCount || 0) });
    const imported = log.details.match(IMPORT_LOG_DETAILS_PATTERN);
    if (imported) {
      return t('sheets.logImportSummary', {
        added: formatNumber(Number(imported[1])),
        updated: formatNumber(Number(imported[2])),
        unchanged: formatNumber(Number(imported[3])),
        skipped: formatNumber(Number(imported[4])),
      });
    }
    const automatic = log.details.match(AUTO_LOG_DETAILS_PATTERN);
    if (automatic) {
      return t('sheets.logAutoSummary', {
        added: formatNumber(Number(automatic[1])),
        updated: formatNumber(Number(automatic[2])),
      });
    }
    return log.details;
  };

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
  // Latest t() for the poller callback, so a language switch does not restart the running poller
  const tRef = useRef(t);
  tRef.current = t;

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
      setErrorMsg(input.trim() ? t('sheets.errorInvalidInput') : t('sheets.errorEmptyInput'));
      return;
    }
    if (!accessToken) {
      setErrorMsg(t('sheets.errorNotConnected'));
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
        setErrorMsg(t('sheets.errorEmptySheet'));
      }
    } catch (err: unknown) {
      console.error('Inspect error:', err);
      setErrorMsg(
        classifySheetsError(err)
          ? describeSheetsError(err, t, user?.email)
          : err instanceof Error
          ? err.message
          : t('sheets.errorReadFailed')
      );
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Run bulk import into Firestore
  const handleImportToFirebase = async () => {
    const targetId = selectedSpreadsheetId;
    if (!targetId || !accessToken) {
      setErrorMsg(t('sheets.errorInspectFirst'));
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);
    setImportResult(null);

    try {
      // Fetch all rows
      const allRows = await fetchSheetValues(accessToken, targetId, sheetRange(selectedTab, 'A1:Z2000'));
      if (allRows.length <= 1) {
        throw new Error(t('sheets.errorNoRows'));
      }

      const membersToImport = parseRowsToMembers(
        allRows,
        columnMapping,
        totalMembersInFirestore,
        'spreadsheet_import'
      );

      if (membersToImport.length === 0) {
        throw new Error(t('sheets.errorNoValidRows'));
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
          source: SYNC_SOURCE_IMPORTER,
          syncedAt: new Date().toISOString(),
          details: importLogDetails(result),
        });
      } catch (logErr) {
        console.warn('Sync log write failed:', logErr);
      }
    } catch (err: unknown) {
      console.error('Import error:', err);
      setErrorMsg(classifySheetsError(err) ? describeSheetsError(err, t, user?.email) : describeFirestoreError(err));
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
                source: SYNC_SOURCE_POLLER,
                syncedAt: new Date().toISOString(),
                details: autoSyncLogDetails(res),
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
            classifySheetsError(e) ? describeSheetsError(e, tRef.current, user?.email) : describeFirestoreError(e)
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
 * ${t('sheets.scriptCommentInstall')}
 * ${t('sheets.scriptCommentTrigger')}
 */
function onFormSubmit(e) {
  var targetUrl = "${webhookUrl}";

  // ${t('sheets.scriptCommentResponseData')}
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
          <span className="glass-chip font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('sheets.bridgeBadge')}</span>
          </span>
          <span className="text-xs text-slate-400">{t('sheets.bridgeSubtitle')}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{t('sheets.pageTitle')}</h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-1">{t('sheets.pageDesc')}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAuthorizeGoogle}
              disabled={isLoadingSheets}
              className="glass-button pressable rounded-2xl px-4 text-xs font-bold hover:border-emerald-500/50"
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <span>{accessToken ? t('sheets.renewAccess') : t('sheets.connectSheets')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auth Alert if token is not ready */}
      {!accessToken && (
        <div className="glass-card border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t('sheets.connectionRequiredTitle')}</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{t('sheets.connectionRequiredDesc')}</p>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-xl mt-2">
                {user?.email
                  ? t('sheets.accessRequestNoticeWithEmail', { email: user.email })
                  : t('sheets.accessRequestNotice')}
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
            className="pressable px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>{t('sheets.connectSheets')}</span>
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SPREADSHEET PICKER & COLUMN MAPPER (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: PILIH SPREADSHEET */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('sheets.step1Title')}</h2>
                  <p className="text-xs text-slate-400">{t('sheets.step1Desc')}</p>
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
                  {t('sheets.spreadsheetInputLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    aria-label={t('sheets.spreadsheetInputLabel')}
                    placeholder={t('sheets.spreadsheetInputPlaceholder')}
                    value={sheetInput}
                    onChange={(e) => handleSheetInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInspectSpreadsheet();
                      }
                    }}
                    className="flex-1 min-w-0 glass-input px-4 py-3 text-base sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectSpreadsheet()}
                    disabled={isLoadingSheets || !sheetInput.trim()}
                    className="pressable px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                  >
                    <span>{t('sheets.inspectButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {renderMarkedText(t('sheets.formatHint'))}
                  {sheetInput.trim() && !parsedInputId && (
                    <span className="block text-rose-300 mt-1">{t('sheets.inputNotRecognised')}</span>
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
                    {t('sheets.sheetTabLabel')}
                  </label>
                  <select
                    value={selectedTab}
                    onChange={(e) => {
                      setSelectedTab(e.target.value);
                      handleInspectSpreadsheet(selectedSpreadsheetId, e.target.value);
                    }}
                    className="w-full glass-input text-base sm:text-sm"
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
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('sheets.step2Title')}</h2>
                    <p className="text-xs text-slate-400">
                      {t('sheets.step2Desc', { count: formatNumber(headers.length) })}
                    </p>
                  </div>
                </div>

                <span className="glass-chip font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {t('sheets.autoDetectedBadge')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    {t('sheets.columnFullName')} <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.fullName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, fullName: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionChooseColumn')}</option>
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
                    {t('sheets.columnCosname')} <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.cosplayName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, cosplayName: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionChooseColumn')}</option>
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
                    {t('sheets.columnEmail')} <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.email}
                    onChange={(e) => setColumnMapping({ ...columnMapping, email: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionChooseColumn')}</option>
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
                    {t('sheets.columnWhatsapp')} <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={columnMapping.phone}
                    onChange={(e) => setColumnMapping({ ...columnMapping, phone: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionNone')}</option>
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
                    {t('sheets.columnWhatsapp2')}{' '}
                    <span className="text-slate-500 font-normal">{t('sheets.optionalTag')}</span>
                  </label>
                  <select
                    value={columnMapping.phone2 ?? -1}
                    onChange={(e) => setColumnMapping({ ...columnMapping, phone2: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionNone')}</option>
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
                    {t('sheets.columnDiscord')}
                  </label>
                  <select
                    value={columnMapping.discordUsername}
                    onChange={(e) => setColumnMapping({ ...columnMapping, discordUsername: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionNone')}</option>
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
                    {t('sheets.columnCity')}
                  </label>
                  <select
                    value={columnMapping.city}
                    onChange={(e) => setColumnMapping({ ...columnMapping, city: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionDefaultIndonesia')}</option>
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
                    {t('sheets.columnRole')}
                  </label>
                  <select
                    value={columnMapping.primaryRole}
                    onChange={(e) => setColumnMapping({ ...columnMapping, primaryRole: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionDefaultCosplayer')}</option>
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
                    {t('sheets.columnFandom')}
                  </label>
                  <select
                    value={columnMapping.fandom}
                    onChange={(e) => setColumnMapping({ ...columnMapping, fandom: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionDefaultAnimeGames')}</option>
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
                    {t('sheets.columnTimestamp')}
                  </label>
                  <select
                    value={columnMapping.timestamp}
                    onChange={(e) => setColumnMapping({ ...columnMapping, timestamp: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 text-base sm:text-sm"
                  >
                    <option value={-1}>{t('sheets.optionCurrentTime')}</option>
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
                <div className="mb-6 glass-well rounded-2xl p-4 overflow-x-auto">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-2">
                    {t('sheets.previewTitle')}
                  </p>
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 border-b border-white/10 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-1.5 pr-3">{t('sheets.previewColName')}</th>
                        <th className="py-1.5 px-3">WhatsApp</th>
                        <th className="py-1.5 px-3">{t('sheets.previewColDiscord')}</th>
                        <th className="py-1.5 pl-3">{t('sheets.previewColCity')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-slate-200">
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
                              {wa2Val && (
                                <span className="block text-[10px] text-emerald-300/80">
                                  {t('sheets.previewPhone2', { phone: wa2Val })}
                                </span>
                              )}
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
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 pressable-soft disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {t('sheets.importing', {
                        completed: formatNumber(importProgress.completed),
                        total: formatNumber(importProgress.total),
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>{t('sheets.importAllButton')}</span>
                  </>
                )}
              </button>

              {/* Result banner */}
              {importResult && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      {renderMarkedText(
                        t('sheets.importResult', {
                          added: formatNumber(importResult.added),
                          updated: formatNumber(importResult.updated),
                          unchanged: formatNumber(importResult.unchanged),
                          skipped: formatNumber(importResult.skipped),
                        })
                      )}
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
                  <p className="text-[11px] text-rose-300/80 mt-1">{t('sheets.errorTip')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAuthorizeGoogle}
                disabled={isLoadingSheets}
                className="pressable px-4 py-2.5 pointer-coarse:min-h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shrink-0 flex items-center space-x-2 shadow-md disabled:opacity-50"
              >
                <Key className="w-4 h-4 text-emerald-600" />
                <span>{t('sheets.grantAccessButton')}</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME TRANSITION ENGINE & APPS SCRIPT (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* REAL-TIME LIVE POLLER */}
          <div className="glass-card border-emerald-500/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
            {/* Soft glow: a radial gradient instead of `filter: blur()` (no offscreen blur layer) */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 -mr-24 -mt-24 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(closest-side,rgba(16,185,129,0.14),rgba(16,185,129,0))]"
            ></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="flex h-3 w-3 relative">
                  {/* Only pulse while the poller is running */}
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full ${
                      isAutoSyncActive ? 'animate-ping bg-emerald-400 opacity-75' : 'bg-slate-600'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isAutoSyncActive ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  ></span>
                </span>
                <h3 className="font-bold text-white text-base">{t('sheets.pollerTitle')}</h3>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAutoSyncActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/[0.07] text-slate-400 border border-white/10'
                }`}
              >
                {isAutoSyncActive ? t('sheets.pollerActive') : t('sheets.pollerInactive')}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {t('sheets.pollerDesc', { seconds: formatNumber(pollIntervalSeconds) })}
            </p>

            <div className="glass-well p-4 rounded-2xl space-y-3 mb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('sheets.pollIntervalLabel')}</span>
                <select
                  value={pollIntervalSeconds}
                  onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
                  aria-label={t('sheets.pollIntervalLabel')}
                  className="glass-input px-3 py-1.5 text-base sm:text-sm"
                >
                  <option value={15}>{t('sheets.pollEverySeconds', { seconds: formatNumber(15) })}</option>
                  <option value={30}>{t('sheets.pollEverySecondsOptimal', { seconds: formatNumber(30) })}</option>
                  <option value={60}>{t('sheets.pollEverySeconds', { seconds: formatNumber(60) })}</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('sheets.lastPollLabel')}</span>
                <span className="font-mono text-slate-200">
                  {lastPollTime
                    ? formatDate(lastPollTime, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : t('sheets.lastPollNever')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isAutoSyncActive && !selectedSpreadsheetId) {
                  setErrorMsg(t('sheets.errorCheckFirst'));
                  return;
                }
                setIsAutoSyncActive(!isAutoSyncActive);
              }}
              className={`pressable w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 ${
                isAutoSyncActive
                  ? 'glass-button text-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              {isAutoSyncActive ? (
                <span>{t('sheets.stopPoller')}</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('sheets.startAutoSync')}</span>
                </>
              )}
            </button>
          </div>

          {/* GOOGLE APPS SCRIPT WEBHOOK TRIGGER OPTION */}
          <div className="glass-card border-indigo-500/30 rounded-3xl p-6 sm:p-7">
            <div className="flex items-center space-x-2 mb-3">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">{t('sheets.webhookTitle')}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{renderMarkedText(t('sheets.webhookDesc'))}</p>

            {/* Code Box */}
            <div className="relative glass-well rounded-2xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 mb-4">
              <button
                onClick={copyScriptToClipboard}
                className="glass-button pressable touch-target absolute top-2.5 right-2.5 min-h-0 px-2.5 py-1 gap-1 rounded-lg text-xs font-sans"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{t('sheets.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('sheets.copyScript')}</span>
                  </>
                )}
              </button>
              <pre className="text-slate-400" dir="ltr">{appsScriptCode}</pre>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-white">{t('sheets.installStepsTitle')}</p>
              <p>{renderMarkedText(t('sheets.installStep1'))}</p>
              <p>{renderMarkedText(t('sheets.installStep2'))}</p>
              <p>{renderMarkedText(t('sheets.installStep3'))}</p>
            </div>
          </div>

          {/* RECENT SYNC LOGS */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-sm">{t('sheets.recentSyncTitle')}</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {t('sheets.logCount', { count: formatNumber(syncLogs.length) })}
              </span>
            </div>

            {syncLogsError === 'permission-denied' ? (
              <p className="text-xs text-rose-300 font-semibold py-3 text-center">{t('sheets.logsPermissionDenied')}</p>
            ) : syncLogsError ? (
              <p className="text-xs text-amber-300 py-3 text-center">{t('sheets.logsLoadFailed')}</p>
            ) : syncLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">{t('sheets.logsEmpty')}</p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="glass-well p-3 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-400">{describeLogSource(log.source)}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDate(log.syncedAt, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{describeLogDetails(log)}</p>
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
