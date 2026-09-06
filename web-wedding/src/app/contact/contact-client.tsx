'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Check } from 'lucide-react';

export default function ContactClient({ settings, content }: { settings: { email?: string; phone?: string; location?: string; serviceArea?: string; socialLinks: { platform: string; url: string }[] }; content: any }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    weddingDate: '',
    message: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.heroImage}
            alt={content.heroImageAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-accent/10" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">
            {content.heroEyebrow}
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
            {content.heroHeadingLine1} <span className="font-script font-normal">{content.heroHeadingScript}</span>
          </h1>
        </div>
      </section>

      {/* Contact */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20">
            {/* Form */}
            <div className="lg:col-span-3">
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
                    {content.successDescription} {' '}
                    <a href={`mailto:${settings.email}`} className="text-accent">
                      {settings.email}
                    </a>
                    .
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', weddingDate: '', message: '' });
                    }}
                    className="mt-8 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {content.sendAnotherLabel}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-3">
                      {content.nameLabel}
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder={content.namePlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-3">
                      {content.emailLabel}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder={content.emailPlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="weddingDate" className="block text-sm font-medium mb-3">
                      {content.weddingDateLabel} <span className="text-muted-foreground font-light">{content.optionalLabel}</span>
                    </label>
                    <input
                      id="weddingDate"
                      type="date"
                      value={form.weddingDate}
                      onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-3">
                      {content.messageLabel}
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                      placeholder={content.messagePlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {content.submitLabel}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <div className="bg-secondary/40 rounded-sm p-8 border border-border/50 sticky top-28">
                <h3 className="font-serif text-2xl mb-8">{content.contactInfoHeading}</h3>
                <ul className="space-y-6">
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-10 h-10 bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-light">
                          {content.contactEmailLabel}
                        </p>
                        <p className="text-foreground group-hover:text-accent transition-colors font-light">
                          {settings.email}
                        </p>
                      </div>
                    </a>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-light">
                        {content.contactPhoneLabel}
                      </p>
                      <p className="text-foreground font-light">{settings.phone}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-light">
                        {content.contactLocationLabel}
                      </p>
                      <p className="text-foreground font-light">{settings.location}</p>
                      <p className="text-sm text-muted-foreground mt-1 font-light">
                        {settings.serviceArea}
                      </p>
                    </div>
                  </li>
                  <li>
                    <a
                      href={settings.socialLinks.find((item) => item.platform === 'instagram')?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-10 h-10 bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Instagram className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-light">
                          {content.instagramLabel}
                        </p>
                        <p className="text-foreground group-hover:text-accent transition-colors font-light">
                          {content.instagramHandle}
                        </p>
                      </div>
                    </a>
                  </li>
                </ul>

                <div className="mt-10 pt-6 border-t border-border/50">
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
