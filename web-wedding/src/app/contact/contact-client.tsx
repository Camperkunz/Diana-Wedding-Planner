'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { LuMail as Mail, LuPhone as Phone, LuMapPin as MapPin, LuInstagram as Instagram, LuSend as Send, LuCheck as Check } from 'react-icons/lu';
import { sendEmailAction } from '@/app/actions/sendEmail';
import { PRIVACY_POLICY_LAST_UPDATED } from '@/lib/legal';
import HeroSection from '@/components/ui/HeroSection';

interface ServiceItem {
  _id: string;
  name: string;
}

interface CustomField {
  label: string;
  placeholder?: string;
  fieldType: 'text' | 'email' | 'date' | 'textarea' | 'select' | 'servicesReference';
  required?: boolean;
  options?: string[];
  _key?: string;
}

interface ContactClientProps {
  services?: ServiceItem[];
  settings: {
    email?: string;
    phone?: string;
    location?: string;
    serviceArea?: string;
    socialLinks: { platform: string; url: string }[];
  };
  c: {
    heroEyebrow?: string;
    heroHeading?: string;
    heroImage?: string;
    heroImageAlt?: string;
    formHeading?: string;
    formDescription?: string;
    submitLabel?: string;
    customFields?: CustomField[];
    successHeading?: string;
    successDescription?: string;
    sendAnotherLabel?: string;
    contactInfoHeading?: string;
    contactEmailLabel?: string;
    contactPhoneLabel?: string;
    contactLocationLabel?: string;
    instagramLabel?: string;
    directReplyText?: string;
  };
}

/**
 * The contact card shows the shared Instagram account from Site Settings
 * (Social Media Accounts). The handle is derived from that one URL so the
 * page never keeps its own copy of it.
 */
function instagramHandleFromUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const segment = new URL(url).pathname.split('/').filter(Boolean)[0];
    return segment ? `@${segment.replace(/^@/, '')}` : null;
  } catch {
    return null;
  }
}

export default function ContactClient({ services, settings, c }: ContactClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  // Data-processing consent. The `required` attribute below already stops the
  // browser from submitting without it; this state exists so the consent can be
  // recorded with the message (proof of consent) and reset afterwards.
  const [consent, setConsent] = useState(false);

  const instagramUrl = settings.socialLinks.find((item) => item.platform === 'instagram')?.url;
  const instagramHandle = instagramHandleFromUrl(instagramUrl);

  const handleInputChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Honeypot value rides along with the real fields; the server silently
    // discards the submission when it is filled (see actions/sendEmail.ts).
    // The recipient is resolved server-side from Sanity inside the action —
    // never sent from the client (prevents abuse as an open email relay).
    //
    // The consent is recorded with the message: the delivered e-mail itself is
    // the record that consent was given, and to which revision of the policy it
    // referred. The label is deliberately free of "name"/"email", so it cannot
    // confuse the reply-to/subject detection in the action.
    const result = await sendEmailAction({
      formData: {
        ...formData,
        'Privacy Policy Consent': `Accepted — policy version ${PRIVACY_POLICY_LAST_UPDATED}`,
      },
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* Hero */}
      <HeroSection
        eyebrow={c.heroEyebrow}
        heading={c.heroHeading}
        image={c.heroImage}
        imageAlt={c.heroImageAlt}
      />

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20">
            {/* Form Column - Displays second on mobile, first on desktop */}
            <div className="order-2 lg:order-1 lg:col-span-3">
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6 text-balance">
                {c.formHeading}
              </h2>
              <p className="text-muted-foreground font-light mb-10 leading-relaxed">
                {c.formDescription}
              </p>

              {submitted ? (
                <div className="bg-card rounded-sm p-12 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-accent/20 flex items-center justify-center mx-auto mb-8">
                    <Check className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">{c.successHeading}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                    {c.successDescription}{' '}
                    {settings.email && (
                      <a href={`mailto:${settings.email}`} className="text-accent">
                        {settings.email}
                      </a>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({});
                      setConsent(false);
                    }}
                    className="mt-8 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {c.sendAnotherLabel}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot — visually hidden and skipped by keyboard/screen
                    readers. Humans never fill it; bots that do get a fake
                    "success" response and their message is dropped server-side. */}
                <input
                  type="text"
                  name="_hp_website"
                  value={formData['_hp_website'] || ''}
                  onChange={(e) => handleInputChange('_hp_website', e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
                />
                  {c.customFields?.map((field, idx) => {
                    const fieldId = field._key || `field-${idx}`;
                    return (
                      <div key={fieldId}>
                        {field.fieldType === 'select' || field.fieldType === 'servicesReference' ? (
                          <div className="flex flex-col gap-2">
                            <label htmlFor={fieldId} className="block text-sm font-medium mb-1">
                              {field.label} {field.required && <span className="text-accent">*</span>}
                            </label>

                            <div className="relative">
                              <select
                                id={fieldId}
                                name={field.label}
                                required={field.required}
                                value={formData[field.label] || ''}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all appearance-none"
                              >
                                <option value="" disabled>
                                  {field.placeholder || 'Select an option...'}
                                </option>

                                {/* Manual rendering */}
                                {field.fieldType === 'select' &&
                                  field.options?.map((option, optionIdx) => (
                                    <option key={optionIdx} value={option}>
                                      {option}
                                    </option>
                                  ))}

                                {/* Services Reference */}
                                {field.fieldType === 'servicesReference' &&
                                  services?.map((service) => (
                                    <option key={service._id} value={service.name}>
                                      {service.name}
                                    </option>
                                  ))}
                              </select>

                              {/* Custom dropdown arrow */}
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <label htmlFor={fieldId} className="block text-sm font-medium mb-3">
                              {field.label} {field.required && <span className="text-accent">*</span>}
                            </label>

                            {field.fieldType === 'textarea' ? (
                              <textarea
                                id={fieldId}
                                required={field.required}
                                rows={6}
                                value={formData[field.label] || ''}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                                placeholder={field.placeholder}
                              />
                            ) : (
                              <input
                                id={fieldId}
                                type={field.fieldType}
                                required={field.required}
                                value={formData[field.label] || ''}
                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                                placeholder={field.placeholder}
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* Data-processing consent — last element of the form, right above
                      the submit button. `required` gives the same native validation as
                      the other fields, and the text is one <label> so the checkbox is
                      clickable through the whole sentence. */}
                  <div className="flex items-start gap-3 rounded-sm border border-border/60 bg-card/50 p-4">
                    <input
                      id="privacy-consent"
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-accent"
                    />
                    <label
                      htmlFor="privacy-consent"
                      className="cursor-pointer text-sm font-light leading-relaxed text-muted-foreground"
                    >
                      I have read and agree to the{' '}
                      <Link
                        href="/privacy"
                        className="text-accent underline underline-offset-2 hover:text-accent/80 focus-visible:text-accent/80"
                      >
                        Privacy Policy
                      </Link>{' '}
                      and consent to the processing of my personal data for the purpose of answering my
                      enquiry, including the use of cookies and analytics as described there.{' '}
                      <span className="text-accent">*</span>
                    </label>
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-red-500 font-light">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : c.submitLabel}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Column - Displays first on mobile, second on desktop */}
            <div className="order-1 lg:order-2 lg:col-span-2 relative">
              <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/40 shadow-xl sticky top-28">
                <h3 className="font-serif text-3xl mb-8 text-foreground">{c.contactInfoHeading}</h3>

                <ul className="space-y-2">
                  {settings.email && (
                    <li>
                      <a href={`mailto:${settings.email}`} className="flex items-center gap-5 p-3 -mx-3 rounded-2xl hover:bg-muted/50 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                          <Mail className="w-5 h-5 text-accent group-hover:text-current" />
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1 font-light">
                            {c.contactEmailLabel}
                          </p>
                          <p className="text-base text-foreground font-medium group-hover:text-accent transition-colors">
                            {settings.email}
                          </p>
                        </div>
                      </a>
                    </li>
                  )}
                  {settings.phone && (
                    <li className="flex items-center gap-5 p-3 -mx-3 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1 font-light">
                          {c.contactPhoneLabel}
                        </p>
                        <p className="text-base text-foreground font-medium">{settings.phone}</p>
                      </div>
                    </li>
                  )}
                  {settings.location && (
                    <li className="flex items-center gap-5 p-3 -mx-3 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1 font-light">
                          {c.contactLocationLabel}
                        </p>
                        <p className="text-base text-foreground font-medium">{settings.location}</p>
                      </div>
                    </li>
                  )}
                  {instagramUrl && instagramHandle && (
                    <li>
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-5 p-3 -mx-3 rounded-2xl hover:bg-muted/50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                          <Instagram className="w-5 h-5 text-accent group-hover:text-current" />
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1 font-light">
                            {c.instagramLabel || 'Instagram'}
                          </p>
                          <p className="text-base text-foreground font-medium group-hover:text-accent transition-colors">
                            {instagramHandle}
                          </p>
                        </div>
                      </a>
                    </li>
                  )}
                </ul>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {c.directReplyText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}