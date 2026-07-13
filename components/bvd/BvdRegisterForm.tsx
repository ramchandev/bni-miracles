"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { submitBvdRegistrationAction } from "@/app/actions/bvd";

type FormData = {
  name: string;
  business_name: string;
  business_category: string;
  invited_by: string;
  phone: string;
  email: string;
  wants_breakfast: boolean;
};

type Props = {
  breakfastAmount: number;
  paymentQrUrl: string | null;
  lvhPhone: string | null;
};

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("91") ? digits : `91${digits}`}`;
}

export default function BvdRegisterForm({
  breakfastAmount,
  paymentQrUrl,
  lvhPhone,
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { wants_breakfast: true },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const result = await submitBvdRegistrationAction(data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center bg-white shadow-2xl border border-gray-100"
      >
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />

        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
          Registration Submitted!
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
          You are 1 step closer to securing your seat. Your seat is confirmed only after completing the payment below.
        </p>

        {/* Steps Box */}
        <div className="text-left mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm">
          <p className="font-bold text-slate-700 mb-2">Steps to Complete Confirmation:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Scan/save the QR code below and pay <strong>₹{breakfastAmount}</strong>.</li>
            <li>Send a screenshot of the payment receipt to the Lead Visitor Host.</li>
          </ol>
        </div>

        {paymentQrUrl ? (
          <div className="inline-block p-4 rounded-3xl mb-6 bg-gray-50 border border-gray-100 shadow-inner">
            <Image
              src={paymentQrUrl}
              alt="Payment QR code"
              width={200}
              height={200}
              className="mx-auto rounded-2xl border border-gray-200 bg-white p-2"
              unoptimized
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold mt-4">
              ₹{breakfastAmount} Breakfast Fee
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl mb-6 text-sm bg-amber-50 border border-amber-100 text-amber-800">
            Payment QR code will be shared shortly. Please contact the Lead Visitor Host directly via WhatsApp to complete payment details.
          </div>
        )}

        {lvhPhone ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">
              Click below to send your payment screenshot:
            </p>
            <a
              href={waLink(lvhPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 duration-150"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-2.091c1.616.958 3.202 1.488 4.793 1.489 5.568 0 10.105-4.524 10.108-10.093.001-2.7-1.05-5.233-2.955-7.14C16.688 4.25 14.164 3.2 11.485 3.2 5.918 3.2 1.38 7.724 1.377 13.293c-.001 1.77.473 3.499 1.38 5.04l-.999 3.648 3.754-.984c1.472.804 2.945 1.205 4.535 1.205zM17.65 19.3c-.328-.164-1.94-.957-2.24-1.066-.3-.11-.519-.164-.738.164-.219.328-.849 1.066-1.04 1.284-.191.219-.383.246-.71.082-.328-.164-1.386-.511-2.64-1.63-1.053-.938-1.745-2.098-1.951-2.453-.207-.355-.022-.547.143-.711.148-.148.328-.383.493-.574.164-.191.219-.328.328-.547.11-.219.055-.41-.027-.574-.082-.164-.738-1.777-1.012-2.433-.267-.65-.54-.563-.738-.574l-.629-.012c-.219 0-.575.082-.876.41-.3.328-1.15 1.121-1.15 2.734 0 1.613 1.177 3.172 1.34 3.391.164.219 2.31 3.528 5.596 4.945.781.337 1.39.539 1.865.69.785.249 1.498.214 2.062.129.629-.095 1.94-.793 2.213-1.559.273-.766.273-1.422.191-1.559-.082-.137-.3-.219-.629-.383z" />
              </svg>
              WhatsApp Receipt to {lvhPhone}
            </a>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-4">
            Contact the chapter host to share your payment screenshot.
          </p>
        )}
      </div>
    );
  }

  const fieldClass =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500";
  const labelClass = "block text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-500";
  
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-2xl border border-gray-100"
      id="register-form"
    >
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />

      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
        Reserve Your Seat
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Fill in your details to register for Chennai&apos;s flagship Big Visitor Day.
      </p>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            placeholder="Your full name"
            className={fieldClass}
            style={errors.name ? { borderColor: "var(--color-primary)" } : { borderColor: "#E5E7EB" }}
            {...register("name", { required: true })}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={fieldClass}
            style={errors.email ? { borderColor: "var(--color-primary)" } : { borderColor: "#E5E7EB" }}
            {...register("email", { required: true })}
          />
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            className={fieldClass}
            style={errors.phone ? { borderColor: "var(--color-primary)" } : { borderColor: "#E5E7EB" }}
            {...register("phone", { required: true })}
          />
        </div>

        {/* Invited By */}
        <div>
          <label className={labelClass}>Invited by</label>
          <input
            type="text"
            placeholder="Name of member"
            className={fieldClass}
            style={errors.invited_by ? { borderColor: "var(--color-primary)" } : { borderColor: "#E5E7EB" }}
            {...register("invited_by", { required: true })}
          />
        </div>

        {/* Business Name */}
        <div className="md:col-span-2">
          <label className={labelClass}>Business Name</label>
          <input
            type="text"
            placeholder="Company or professional practice name"
            className={fieldClass}
            style={errors.business_name ? { borderColor: "var(--color-primary)" } : { borderColor: "#E5E7EB" }}
            {...register("business_name", { required: true })}
          />
        </div>

        {/* Business Category */}
        <div className="md:col-span-2">
          <label className={labelClass}>Business Category / Industry</label>
          <input
            type="text"
            placeholder="e.g. Interior Designer, Chartered Accountant, Web Developer"
            className={fieldClass}
            style={errors.business_category ? { borderColor: "var(--color-primary)" } : { borderColor: "#E5E7EB" }}
            {...register("business_category", { required: true })}
          />
        </div>

        {/* Checkbox wrapper */}
        <div className="md:col-span-2 mt-2">
          <label
            className="flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer border hover:shadow-sm transition-all duration-200"
            style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}
          >
            <input
              type="checkbox"
              className="mt-1.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              {...register("wants_breakfast")}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">
                Register with Breakfast (₹{breakfastAmount})
              </span>
              <span className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Highly recommended. Join our post-meeting breakfast, network directly with members, and build warm connections.
              </span>
            </div>
          </label>
        </div>

        {error && (
          <div className="md:col-span-2 text-sm p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-extrabold text-base bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/10 hover:shadow-red-600/25 hover:-translate-y-0.5 active:translate-y-0 duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Registration...
              </span>
            ) : (
              "Reserve My Seat Now"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
