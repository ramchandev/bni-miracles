import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GivesAsksCategoryForm from "@/components/admin/GivesAsksCategoryForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { GivesAsksCategory } from "@/lib/supabase";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit Gives & Asks Category — Miracle Members Admin" };

export default async function EditGivesAsksCategoryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: category } = await supabase
    .from("gives_asks_categories")
    .select("*")
    .eq("id", id)
    .single<GivesAsksCategory>();

  if (!category) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/gives-asks/categories" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Categories
        </Link>
        <span style={{ color: "#E5E7EB" }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
          {category.name}
        </h1>
      </div>
      <GivesAsksCategoryForm category={category} />
    </div>
  );
}
