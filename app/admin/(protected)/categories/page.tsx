import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { DeleteGroupButton, DeleteCategoryButton } from '@/components/admin/CategoryDeleteButtons';
import type { BusinessCategory, CategoryGroup } from '@/lib/supabase';

export const metadata: Metadata = { title: 'Categories — BNI Miracles Admin' };

export default async function AdminCategoriesPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: groups }, { data: categories }] = await Promise.all([
    supabase.from('category_groups').select('*').order('sort_order').returns<CategoryGroup[]>(),
    supabase
      .from('business_categories')
      .select('*, category_groups(name)')
      .order('sort_order')
      .returns<BusinessCategory[]>(),
  ]);

  const allGroups = groups ?? [];
  const allCats = categories ?? [];

  // Build a map: group_id → categories[]
  const catsByGroup = new Map<string | null, BusinessCategory[]>();
  catsByGroup.set(null, []);
  for (const g of allGroups) catsByGroup.set(g.id, []);
  for (const c of allCats) {
    const key = c.group_id ?? null;
    if (!catsByGroup.has(key)) catsByGroup.set(key, []);
    catsByGroup.get(key)!.push(c);
  }

  return (
    <div>
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>
            Business Categories
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-gray)' }}>
            {allCats.length} categories across {allGroups.length} groups
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/categories/groups/new" className="btn-outline text-sm">
            + Add Group
          </Link>
          <Link href="/admin/categories/new" className="btn-primary text-sm">
            + Add Category
          </Link>
        </div>
      </div>

      {/* ── Groups Table ───────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-dark)' }}>Groups</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Order', 'Group Name', 'Categories', 'Actions'].map((h, j) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${j === 3 ? 'text-right' : j === 2 ? 'text-center' : 'text-left'}`}
                      style={{ color: 'var(--color-gray)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allGroups.map((g, i) => (
                  <tr
                    key={g.id}
                    style={{ borderBottom: i < allGroups.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                        style={{ background: '#F3F4F6', color: 'var(--color-dark)' }}
                      >
                        {g.sort_order}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>
                      {g.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                      >
                        {catsByGroup.get(g.id)?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/categories/groups/${g.id}/edit`}
                          className="text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                          style={{ color: 'var(--color-dark)' }}
                        >
                          Edit
                        </Link>
                        <DeleteGroupButton id={g.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {allGroups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-gray)' }}>
                      No groups yet.{' '}
                      <Link href="/admin/categories/groups/new" style={{ color: 'var(--color-primary)' }}>
                        Add one →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Categories by Group ────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-dark)' }}>Categories</h2>
        <div className="flex flex-col gap-5">
          {allGroups.map((g) => {
            const cats = catsByGroup.get(g.id) ?? [];
            return (
              <div key={g.id} className="card overflow-hidden">
                {/* Group header stripe */}
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}
                >
                  <span
                    className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center text-white shrink-0"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {g.sort_order}
                  </span>
                  <span className="font-bold text-sm" style={{ color: 'var(--color-dark)' }}>
                    {g.name}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--color-gray)' }}>
                    ({cats.length})
                  </span>
                </div>

                {cats.length === 0 ? (
                  <p className="px-5 py-4 text-sm" style={{ color: 'var(--color-gray)' }}>
                    No categories in this group yet.
                  </p>
                ) : (
                  <table className="w-full">
                    <tbody>
                      {cats.map((c, i) => (
                        <tr
                          key={c.id}
                          style={{ borderBottom: i < cats.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                        >
                          {/* Icon */}
                          <td className="px-5 py-2.5" style={{ width: 52 }}>
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                              style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                            >
                              {c.icon}
                            </div>
                          </td>
                          {/* Name */}
                          <td className="px-2 py-2.5 text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
                            {c.name}
                          </td>
                          {/* Sort order */}
                          <td className="px-2 py-2.5" style={{ width: 64 }}>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded font-mono"
                              style={{ background: '#F3F4F6', color: 'var(--color-gray)' }}
                            >
                              #{c.sort_order}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-2.5" style={{ width: 120 }}>
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/admin/categories/${c.id}/edit`}
                                className="text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--color-dark)' }}
                              >
                                Edit
                              </Link>
                              <DeleteCategoryButton id={c.id} name={c.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}

          {/* Ungrouped */}
          {(catsByGroup.get(null) ?? []).length > 0 && (
            <div className="card overflow-hidden">
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}
              >
                <span className="font-bold text-sm" style={{ color: 'var(--color-gray)' }}>Ungrouped</span>
                <span className="text-xs" style={{ color: 'var(--color-gray)' }}>
                  ({catsByGroup.get(null)!.length})
                </span>
              </div>
              <table className="w-full">
                <tbody>
                  {catsByGroup.get(null)!.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: i < catsByGroup.get(null)!.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    >
                      <td className="px-5 py-2.5" style={{ width: 52 }}>
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                        >
                          {c.icon}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
                        {c.name}
                      </td>
                      <td className="px-2 py-2.5" style={{ width: 64 }}>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{ background: '#F3F4F6', color: 'var(--color-gray)' }}
                        >
                          #{c.sort_order}
                        </span>
                      </td>
                      <td className="px-4 py-2.5" style={{ width: 120 }}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/categories/${c.id}/edit`}
                            className="text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--color-dark)' }}
                          >
                            Edit
                          </Link>
                          <DeleteCategoryButton id={c.id} name={c.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
