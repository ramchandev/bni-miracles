"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitRegistrationAction } from "@/app/admin/actions/registrations";

type FormData = {
  name: string;
  phone: string;
  meeting_date: string;
};

function getNextThursdays(count = 8): string[] {
  const results: string[] = [];
  const today = new Date();
  const d = new Date(today);
  // advance to next Thursday
  const daysUntilThursday = (4 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilThursday);
  for (let i = 0; i < count; i++) {
    results.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 7);
  }
  return results;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MeetingForm() {
  const thursdays = getNextThursdays(8);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const result = await submitRegistrationAction(data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-8 rounded-xl" style={{ background: "#F0FFF4", border: "2px solid #86EFAC" }}>
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#166534" }}>You're Registered!</h3>
        <p className="text-sm mb-4" style={{ color: "#15803D" }}>
          We'll WhatsApp you the meeting details shortly.
        </p>
        <a
          href="https://wa.me/919841767641"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2"
          style={{ background: "#25D366" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
          Full Name <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <input
          {...register("name", { required: "Name is required" })}
          type="text"
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
          style={{
            border: errors.name ? "1.5px solid var(--color-primary)" : "1.5px solid #E5E7EB",
          }}
        />
        {errors.name && <p className="text-xs mt-1" style={{ color: "var(--color-primary)" }}>{errors.name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
          Phone Number <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <input
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit Indian mobile number",
            },
          })}
          type="tel"
          placeholder="e.g. 9841234567"
          maxLength={10}
          className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
          style={{ border: errors.phone ? "1.5px solid var(--color-primary)" : "1.5px solid #E5E7EB" }}
        />
        {errors.phone && <p className="text-xs mt-1" style={{ color: "var(--color-primary)" }}>{errors.phone.message}</p>}
      </div>

      {/* Thursday Date */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
          Select a Thursday <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <select
          {...register("meeting_date", { required: "Please select a date" })}
          className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none"
          style={{ border: errors.meeting_date ? "1.5px solid var(--color-primary)" : "1.5px solid #E5E7EB" }}
        >
          <option value="">Choose a Thursday...</option>
          {thursdays.map((d) => (
            <option key={d} value={d}>{formatDate(d)}</option>
          ))}
        </select>
        {errors.meeting_date && <p className="text-xs mt-1" style={{ color: "var(--color-primary)" }}>{errors.meeting_date.message}</p>}
      </div>

      {error && (
        <p className="text-sm p-3 rounded-lg" style={{ background: "#FEE2E2", color: "var(--color-primary)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-center"
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Booking..." : "Book My Seat"}
      </button>
    </form>
  );
}
