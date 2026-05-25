import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import CategoryForm from '@/components/admin/CategoryForm';
import type { CategoryGroup } from '@/lib/supabase';

export const metadata: Metadata = { title: 'Add Category — BNI Miracles Admin' };

export default async function NewCategoryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: groups } = await supabase
    .from('category_groups')
    .select('*')
    .order('sort_order')
    .returns<CategoryGroup[]>();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          ← Categories
        </Link>
        <span style={{ color: '#E5E7EB' }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Add Category</h1>
      </div>
      <CategoryForm groups={groups ?? []} />
    </div>
  );
}
