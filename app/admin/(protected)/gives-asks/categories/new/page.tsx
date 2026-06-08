import type { Metadata } from "next";
import Link from "next/link";
import GivesAsksCategoryForm from "@/components/admin/GivesAsksCategoryForm";

export const metadata: Metadata = { title: "Add Gives & Asks Category — BNI Miracles Admin" };

export default function NewGivesAsksCategoryPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/gives-asks/categories" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Categories
        </Link>
        <span style={{ color: "#E5E7EB" }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
          Add Category
        </h1>
      </div>
      <GivesAsksCategoryForm />
    </div>
  );
}
