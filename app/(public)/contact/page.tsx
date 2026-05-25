"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { submitContactAction } from "@/app/admin/actions/contact";
import Link from "next/link";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const result = await submitContactAction(data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <>
      <section className="relative flex items-center justify-center py-32 px-6 text-center" style={{ background: "var(--color-dark)", paddingTop: 120 }}>
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/Contact-Banner.JPG"
            alt="Contact BNI Miracles"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-white/70">We&apos;d love to hear from you — reach out anytime.</p>
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-dark)" }}>Get in Touch</h2>

            <a
              href="https://wa.me/919841767641"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-xl mb-5 transition-transform hover:-translate-y-1"
              style={{ background: "#DCFCE7", textDecoration: "none" }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ background: "#25D366" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <div className="font-bold" style={{ color: "#166534" }}>Chat on WhatsApp</div>
                <div className="text-sm" style={{ color: "#15803D" }}>+91 98417 67641</div>
              </div>
            </a>

            <div className="flex flex-col gap-4 mb-8">
              {[
                { icon: "📅", label: "Meetings", value: "Every Thursday, 7:30 AM – 9:40 AM" },
                { icon: "🌐", label: "Format", value: "Hybrid — Physical + Online (Zoom)" },
                { icon: "📍", label: "Location", value: "Chennai, Tamil Nadu, India" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-white">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-primary)" }}>{item.label}</div>
                    <div className="text-sm font-semibold" style={{ color: "var(--color-dark)" }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div
              className="rounded-xl flex items-center justify-center text-center p-8"
              style={{ background: "#F3F4F6", border: "2px dashed #E5E7EB", height: 220 }}
            >
              <div>
                <p className="text-3xl mb-2">🗺️</p>
                <p className="font-semibold text-sm" style={{ color: "var(--color-gray)" }}>Google Maps</p>
                <p className="text-xs" style={{ color: "var(--color-gray)" }}>Embed coming soon</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-dark)" }}>Send a Message</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#166534" }}>Message Sent!</h3>
                  <p className="text-sm" style={{ color: "var(--color-gray)" }}>We&apos;ll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  {[
                    { name: "name", label: "Full Name", type: "text", placeholder: "Your name", required: true },
                    { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
                    { name: "phone", label: "Phone", type: "tel", placeholder: "9841234567", required: false },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
                        {field.label} {field.required && <span style={{ color: "var(--color-primary)" }}>*</span>}
                      </label>
                      <input
                        {...register(field.name as keyof FormData, field.required ? { required: `${field.label} is required` } : {})}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none"
                        style={{ border: errors[field.name as keyof FormData] ? "1.5px solid var(--color-primary)" : "1.5px solid #E5E7EB" }}
                      />
                      {errors[field.name as keyof FormData] && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-primary)" }}>
                          {errors[field.name as keyof FormData]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
                      Message <span style={{ color: "var(--color-primary)" }}>*</span>
                    </label>
                    <textarea
                      {...register("message", { required: "Message is required" })}
                      placeholder="How can we help you?"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ border: errors.message ? "1.5px solid var(--color-primary)" : "1.5px solid #E5E7EB" }}
                    />
                    {errors.message && <p className="text-xs mt-1" style={{ color: "var(--color-primary)" }}>{errors.message.message}</p>}
                  </div>
                  {error && (
                    <p className="text-sm p-3 rounded-lg" style={{ background: "#FEE2E2", color: "var(--color-primary)" }}>{error}</p>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full" style={{ opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
            <p className="text-center text-sm mt-4" style={{ color: "var(--color-gray)" }}>
              Prefer to attend a meeting? <Link href="/attend-meeting" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Book your seat here.</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
