import React from 'react';
import { ArrowLeft, Shield, FileText, CheckCircle2, AlertCircle, Mail, Globe, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';

export interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  const { t } = useI18n();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in text-[#1E293B]">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="pressable inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/80 border-[1.5px] border-white/95 text-[#0F172A] shadow-sm hover:bg-white transition-[transform,background-color] duration-150"
        >
          <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
          <span>{t('common.backToHome')}</span>
        </button>

        <a
          href="/privacy"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = 'privacy';
          }}
          className="touch-target text-xs sm:text-sm font-semibold text-purple-700 hover:underline inline-flex items-center gap-1"
        >
          <span>{t('common.privacy')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Container */}
      <div className="bg-white/88 border-[1.5px] border-white/95 rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(31,38,135,0.08)] space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-2 font-medium">
            Effective Date: November 15, 2026 • KawanCosplay Community Portal (MyKCC)
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            Welcome to <strong>MyKCC</strong> (<a href="https://mykcc.vercel.app" className="text-purple-700 font-medium hover:underline">https://mykcc.vercel.app</a>), the official community membership and media portal managed by <strong>KawanCosplay Group</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            By accessing our website, applying for a digital membership pass, creating an account via Google Sign-In or email, or uploading cosplay media, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms &amp; Conditions and our <a href="/privacy" onClick={(e) => { e.preventDefault(); window.location.hash = 'privacy'; }} className="text-purple-700 font-semibold hover:underline">Privacy Policy</a>.
          </p>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            If you do not agree to these terms, please refrain from accessing or using the MyKCC portal.
          </p>
        </section>

        {/* 100% SFW Community Guidelines */}
        <section className="space-y-3 p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-700 shrink-0" />
            <span>2. 100% Safe-For-Work (SFW) Community Standard</span>
          </h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            KawanCosplay is strictly dedicated to maintaining a positive, family-friendly, and <strong>100% SFW (Safe-For-Work)</strong> pop-culture environment. All members and visitors must adhere to the following rules:
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-[#1E293B]">
            <li><strong>No Adult or NSFW Content:</strong> Pornography, excessive nudity, sexually suggestive poses, boudoir, gore, or graphic violence are strictly prohibited across all profile fields, avatars, and gallery uploads.</li>
            <li><strong>No Harassment or Hate Speech:</strong> Bullying, discriminatory remarks, hate speech, defamation, or unsolicited contact directed at any cosplayer, photographer, or creator is grounds for immediate termination.</li>
            <li><strong>Authentic Information:</strong> Impersonating another person, creator, or cosplayer is strictly forbidden.</li>
          </ul>
          <p className="text-xs text-[#475569] font-medium mt-2">
            Violations will result in immediate and permanent revocation of your KCC ID Pass and ban from community events.
          </p>
        </section>

        {/* Member ID Pass */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">3. Digital KCC ID Member Pass</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            The KawanCosplay ID (&quot;KCC ID&quot;) is an 8-digit digital pass assigned to verified community members.
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-[#1E293B]">
            <li>The KCC ID is personal and non-transferable. You may not sell, trade, or lend your pass to others.</li>
            <li>The KCC ID is a community membership pass and does not represent an official government-issued identity card or travel document.</li>
            <li>We reserve the right to suspend or revoke any KCC ID that violates community standards or remains inactive.</li>
          </ul>
        </section>

        {/* Google Sign-In & Authentication */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">4. Google Sign-In &amp; Authentication</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            You may choose to authenticate via Google Sign-In. When signing in with Google, MyKCC requests read access to your basic Google profile (name, email address, profile picture).
          </p>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2 font-medium">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              <span>Google API Services User Data Policy / Limited Use</span>
            </p>
            <p>
              MyKCC&apos;s use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-900">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </p>
            <p>
              We do not sell, rent, or transfer your Google user data to data brokers, advertising platforms, or AI model trainers. Your data is used strictly for membership authentication and pass generation.
            </p>
          </div>
        </section>

        {/* Photo Gallery & Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">5. Photo Showcase &amp; Copyright</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            All photos uploaded to the KawanCosplay Community Showcase remain the intellectual property of their respective creators, cosplayers, and photographers.
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-[#1E293B]">
            <li>By uploading photos, you represent and warrant that you own or have obtained all necessary permissions, model releases, and consent from all depicted individuals and photographers.</li>
            <li>You grant KawanCosplay a worldwide, non-exclusive, royalty-free license to display your photo within the MyKCC portal and official social media highlights.</li>
            <li>If you discover an unauthorized photo of yourself or your work, you may request immediate takedown by contacting <a href="mailto:cosplaysehat@gmail.com" className="text-purple-700 font-semibold hover:underline">cosplaysehat@gmail.com</a>.</li>
          </ul>
        </section>

        {/* Account Deletion */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">6. Account Termination &amp; Data Deletion</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            You have the right to terminate your membership and delete all associated data at any time. You may request account deletion by emailing us at <a href="mailto:cosplaysehat@gmail.com" className="text-purple-700 font-semibold hover:underline">cosplaysehat@gmail.com</a> with your KCC ID or registered email. All personal data, profile photos, and credentials will be permanently erased within 30 days.
          </p>
        </section>

        {/* Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">7. Disclaimers &amp; Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            MyKCC is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. KawanCosplay shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to access the service.
          </p>
        </section>

        {/* Contact Information */}
        <section className="space-y-3 border-t border-slate-200/80 pt-6">
          <h2 className="text-lg font-bold text-[#0F172A]">8. Contact &amp; Community Support</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            If you have any questions or feedback regarding these Terms &amp; Conditions, please contact us:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-purple-700 shrink-0" />
              <span><strong>Email:</strong> cosplaysehat@gmail.com</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-700 shrink-0" />
              <span><strong>Community:</strong> KawanCosplay, Jakarta, Indonesia</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
