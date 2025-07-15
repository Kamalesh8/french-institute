'use client';
import { useState } from 'react';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";


export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <>
      <Header />
      {/* Hero */}
      <section className="relative py-24 text-center overflow-hidden bg-gradient-to-br from-primary to-primary/70 dark:from-[#1e3a8a] dark:to-[#1e40af]">
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
            📞 Contact Us – Let’s Connect
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you’re curious about our courses, ready to enroll, or just want to say <em>bonjour</em>, we’d love to hear from you.
          </p>
          <a href="#contact-form" className="inline-block px-8 py-3 text-lg font-semibold rounded-md bg-white/90 text-primary hover:bg-white transition-colors shadow-lg hover-lift">
            See Details
          </a>
        </div>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
      </section>

      {/* Contact Section */}
      <section id="contact-form" className="scroll-mt-24 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">
          {/* Details */}
          <div>
            <h2 id="details" className="text-3xl font-bold mb-6 text-primary">Where to find us</h2>
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><FaPhoneAlt className="text-primary" /> WhatsApp</h3>
                <p className="mt-1"><a
                  href="https://wa.me/916381668408?text=Bonjour!%0A%0AI%20am%20interested%20in%20learning%20French%20with%20your%20institute.%0A%0APlease%20send%20me%20more%20information%20about%20courses%20and%20pricing.%0A%0AMerci!" target="_blank" rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >+91&nbsp;6381668408</a> – Instant replies. Real conversations.</p>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2"><FaEnvelope className="text-primary" /> Email</h3>
                <p className="mt-1"><a href="https://mail.google.com/mail/?view=cm&fs=1&to=ecolebibliotheque@gmail.com&su=Excited%20to%20Learn%20French%20with%20L%27ecole%20Bibliotheque&body=Bonjour%21%0A%0AI%20am%20interested%20in%20learning%20French%20with%20your%20institute.%0A%0APlease%20send%20me%20more%20information.%0A%0AMerci%21" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">ecolebibliotheque@gmail.com</a> – For inquiries, feedback, or partnerships—drop us a line anytime.</p>
              </div>
              <br />
              <p
  className="text-xl md:text-2xl lg:text-3xl text-center text-primary font-bold"
  style={{ fontFamily: 'cursive' }}
>
  <span className="whitespace-nowrap">
    Every&nbsp;language&nbsp;journey&nbsp;begins&nbsp;with&nbsp;a&nbsp;conversation.
  </span>
  <br />
  Let’s&nbsp;start&nbsp;yours&nbsp;today.
</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="p-3 rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-300 focus:outline-primary"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="p-3 rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-300 focus:outline-primary"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="p-3 rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-300 focus:outline-primary md:col-span-2"
              />
            </div>
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
              className="p-3 rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-300 focus:outline-primary resize-none w-full"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'success' && (
              <p className="text-green-600 text-center">Merci! We'll get back to you soon.</p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-center">Oops! Something went wrong. Please try again later.</p>
            )}
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}

