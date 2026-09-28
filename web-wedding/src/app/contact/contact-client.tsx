'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Check } from 'lucide-react';
import { sendEmailAction } from '@/app/actions/sendEmail';

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
  recipientEmail?: string;
  services?: ServiceItem[];
  settings: {
    email?: string;
    phone?: string;
    location?: string;
    serviceArea?: string;
    socialLinks: { platform: string; url: string }[];
  };
  content: {
    heroEyebrow?: string;
    heroHeadingLine1?: string;
    heroHeadingScript?: string;
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
    instagramHandle?: string;
    directReplyText?: string;
  };
}

export default function ContactClient({ recipientEmail, services, settings, content }: ContactClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleInputChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await sendEmailAction({
      recipientEmail: recipientEmail || '',
      formData,
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
      <section className="relative h-[10vh] md:h-[20vh] min-h-[300px] md:min-h-[350px] max-h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {content.heroImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={content.heroImage}
              alt={content.heroImageAlt || 'Hero Image'}
              className="w-full h-full object-cover blur-[2px] scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-accent/30" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-2">
            {content.heroEyebrow}
          </p>
          <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
            {content.heroHeadingLine1} <span className="font-script font-normal">{content.heroHeadingScript}</span>
          </h1>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-28 bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20">
            {/* Form Column - Displays second on mobile, first on desktop */}
            <div className="order-2 lg:order-1 lg:col-span-3">
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6 text-balance">
                {content.formHeading}
              </h2>
              <p className="text-muted-foreground font-light mb-10 leading-relaxed">
                {content.formDescription}
              </p>

              {submitted ? (
                <div className="bg-card rounded-sm p-12 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-accent/15 flex items-center justify-center mx-auto mb-8">
                    <Check className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">{content.successHeading}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                    {content.successDescription}{' '}
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
                    }}
                    className="mt-8 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {content.sendAnotherLabel}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {content.customFields?.map((field, idx) => {
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

                  {errorMessage && (
                    <p className="text-sm text-red-500 font-light">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : content.submitLabel}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Column - Displays first on mobile, second on desktop */}
            <div className="order-1 lg:order-2 lg:col-span-2 relative">
              <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/40 shadow-xl sticky top-28">
                <h3 className="font-serif text-3xl mb-8 text-foreground">{content.contactInfoHeading}</h3>

                <ul className="space-y-2">
                  {settings.email && (
                    <li>
                      <a href={`mailto:${settings.email}`} className="flex items-center gap-5 p-3 -mx-3 rounded-2xl hover:bg-muted/50 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                          <Mail className="w-5 h-5 text-accent group-hover:text-current" />
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1 font-light">
                            {content.contactEmailLabel}
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
                          {content.contactPhoneLabel}
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
                          {content.contactLocationLabel}
                        </p>
                        <p className="text-base text-foreground font-medium">{settings.location}</p>
                      </div>
                    </li>
                  )}
                  <li>
                    <a
                      href={settings.socialLinks.find((item) => item.platform === 'instagram')?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 p-3 -mx-3 rounded-2xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                        <Instagram className="w-5 h-5 text-accent group-hover:text-current" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1 font-light">
                          {content.instagramLabel}
                        </p>
                        <p className="text-base text-foreground font-medium group-hover:text-accent transition-colors">
                          {content.instagramHandle}
                        </p>
                      </div>
                    </a>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {content.directReplyText}
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