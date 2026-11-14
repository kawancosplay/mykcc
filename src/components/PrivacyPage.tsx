import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Trash2, CheckCircle2, Mail, Globe, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';

export interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
          href="/terms"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = 'terms';
          }}
          className="touch-target text-xs sm:text-sm font-semibold text-purple-700 hover:underline inline-flex items-center gap-1"
        >
          <span>{t('common.terms')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Container */}
      <div className="bg-white/88 border-[1.5px] border-white/95 rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(31,38,135,0.08)] space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-2 font-medium">
            Effective Date: November 15, 2026 • KawanCosplay Community Portal (MyKCC)
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <span>1. Overview &amp; Commitment</span>
          </h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            <strong>KawanCosplay Group</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is deeply committed to protecting your privacy and personal data. This Privacy Policy outlines the specific types of data we collect through the MyKCC portal (<a href="https://mykcc.vercel.app" className="text-purple-700 font-medium hover:underline">https://mykcc.vercel.app</a>), how that information is utilized, stored, protected, and how you can exercise full control over your personal data.
          </p>
        </section>

        {/* Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-700 shrink-0" />
            <span>2. Information We Collect</span>
          </h2>
          <div className="space-y-4 text-sm text-[#1E293B]">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900">A. Data Collected via Google Sign-In (OAuth 2.0)</h3>
              <p>When you choose to sign in or register with Google, we request access to the following minimal personal data scopes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                <li><strong>Full Name / Display Name:</strong> Used to identify your member pass and display your creator identity.</li>
                <li><strong>Email Address:</strong> Used for secure login verification and account recovery.</li>
                <li><strong>Profile Picture URL:</strong> Used as your default member pass avatar (can be customized anytime).</li>
                <li><strong>Unique Google Identifier (UID):</strong> Used to link your Firebase authentication session securely.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900">B. Data Provided via the Membership Registration Form</h3>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                <li><strong>Cosplay / Stage Name:</strong> Displayed prominently on your digital KCC ID pass.</li>
                <li><strong>Full Legal Name:</strong> Kept strictly confidential, used solely for community identity verification.</li>
                <li><strong>City &amp; Country:</strong> Displayed on your card as your regional pop-culture chapter.</li>
                <li><strong>Primary Community Role:</strong> Cosplayer, Photographer, Videographer, Content Creator, or Fan.</li>
                <li><strong>Optional Social Media &amp; Phone:</strong> Instagram handle, Discord username, TikTok handle, and WhatsApp number for verification notices.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900">C. Community Gallery Showcase Uploads</h3>
              <p className="text-xs sm:text-sm">Photos you voluntarily upload to the community gallery, along with character and series tags.</p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">3. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            All collected information is used solely to provide and improve the community pass service:
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-[#1E293B]">
            <li>Generating and issuing your unique 8-digit digital KCC ID pass.</li>
            <li>Enabling members to securely log in across mobile and desktop devices.</li>
            <li>Displaying verified community showcase photos in our 100% SFW public gallery.</li>
            <li>Providing member support and handling credential recovery.</li>
          </ul>
        </section>

        {/* Google API User Data Policy / Limited Use Disclosure */}
        <section className="space-y-4 p-5 sm:p-6 rounded-2xl bg-amber-50/90 border-[1.5px] border-amber-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
            <h2 className="text-lg font-extrabold text-amber-950">
              4. Google API Services User Data Policy / Limited Use Disclosure
            </h2>
          </div>
          <p className="text-sm font-bold text-amber-950 leading-relaxed">
            MyKCC&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-purple-800"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <div className="text-xs sm:text-sm text-amber-900 space-y-2 font-medium">
            <p><strong>Specifically, we commit to the following standards:</strong></p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Zero Data Sales:</strong> We do NOT sell, lease, rent, or trade your Google user data or any personal data to third parties, data brokers, or advertising networks.</li>
              <li><strong>Zero Advertising Use:</strong> We do NOT use or transfer your Google user data for serving advertisements, personalized marketing, retargeting, or cross-site tracking.</li>
              <li><strong>Zero AI Model Training:</strong> We do NOT use your Google user data or uploaded photos to train, tune, or evaluate generalized artificial intelligence or machine learning models.</li>
              <li><strong>Restricted Human Access:</strong> No human staff or volunteers are permitted to inspect raw user passwords or unauthorized Google user data. Minimal administrative access is granted solely to verified community managers to resolve technical support issues upon user request.</li>
            </ul>
          </div>
        </section>

        {/* Storage, Encryption & Security */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-700 shrink-0" />
            <span>5. Data Storage, Encryption &amp; Security</span>
          </h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            All member data is stored on enterprise-grade Google Cloud infrastructure (Google Firebase / Firestore) located in secure data centers.
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-[#1E293B]">
            <li><strong>Encryption in Transit:</strong> All communications between your browser and our servers are encrypted using modern Transport Layer Security (TLS 1.3 / HTTPS).</li>
            <li><strong>Encryption at Rest:</strong> All stored database records and uploaded media are encrypted using AES-256 standard encryption.</li>
            <li><strong>Role-Based Access Control:</strong> Strict Firestore Security Rules ensure that member administrative data (such as full real names and phone numbers) can only be accessed by authenticated, verified administrators.</li>
          </ul>
        </section>

        {/* Data Retention & Deletion */}
        <section className="space-y-4 p-5 sm:p-6 rounded-2xl bg-rose-50/80 border-[1.5px] border-rose-200">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-700 shrink-0" />
            <h2 className="text-lg font-bold text-rose-950">6. Data Retention &amp; Right to Deletion</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            You have the absolute right to view, correct, export, or permanently delete your account and all associated personal data at any time.
          </p>
          <div className="p-4 rounded-xl bg-white/90 border border-rose-200 text-xs sm:text-sm space-y-2">
            <h3 className="font-bold text-rose-900">How to Request Immediate Account &amp; Data Deletion:</h3>
            <p className="text-[#1E293B]">
              Send an email to{' '}
              <a href="mailto:cosplaysehat@gmail.com" className="font-bold text-purple-700 underline">
                cosplaysehat@gmail.com
              </a>{' '}
              with the subject <strong>&quot;Data Deletion Request&quot;</strong> and include:
            </p>
            <ol className="list-decimal list-inside space-y-1 font-medium text-[#1E293B]">
              <li>Your registered email address or Google account email.</li>
              <li>Your 8-digit KCC ID number (if known).</li>
            </ol>
            <p className="text-xs text-[#475569] font-medium mt-2">
              Upon receipt of your request, our administrative team will verify your identity and permanently purge your member profile, all uploaded gallery photos, and your Firebase Authentication record within 30 days.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">7. Children&apos;s Privacy</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            MyKCC is a 100% SFW community resource, but our services are directed to individuals aged 13 and above. We do not knowingly collect personal identifiable information from children under 13 without verifiable parental consent. If we learn that we have collected information from a child under 13 without verification, we promptly delete that information.
          </p>
        </section>

        {/* Contact Information */}
        <section className="space-y-3 border-t border-slate-200/80 pt-6">
          <h2 className="text-lg font-bold text-[#0F172A]">8. Contact Us</h2>
          <p className="text-sm leading-relaxed text-[#1E293B]">
            For questions about this Privacy Policy, your personal data, or to exercise your privacy rights, please reach out directly:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-purple-700 shrink-0" />
              <span><strong>Email:</strong> cosplaysehat@gmail.com</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-700 shrink-0" />
              <span><strong>Website:</strong> https://mykcc.vercel.app</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
