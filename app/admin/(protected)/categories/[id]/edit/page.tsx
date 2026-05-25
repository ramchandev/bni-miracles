import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import CategoryForm from '@/components/admin/CategoryForm';
import type { BusinessCategory, CategoryGroup } from '@/lib/supabase';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Edit Category — BNI Miracles Admin' };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: category }, { data: groups }] = await Promise.all([
    supabase.from('business_categories').select('*').eq('id', id).single<BusinessCategory>(),
    supabase.from('category_groups').select('*').order('sort_order').returns<CategoryGroup[]>(),
  ]);

  if (!category) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          ← Categories
        </Link>
        <span style={{ color: '#E5E7EB' }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>
          Edit: {category.icon} {category.name}
        </h1>
      </div>
      <CategoryForm category={category} groups={groups ?? []} />
    </div>
  );
}
