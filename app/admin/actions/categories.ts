'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ─── Groups ──────────────────────────────────────────────────────────────────

export async function saveGroupAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient();
  const id = formData.get('id') as string | null;
  const name = (formData.get('name') as string).trim();
  const sort_order = parseInt(formData.get('sort_order') as string) || 0;

  if (!name) return { error: 'Group name is required.' };

  let error;
  if (id) {
    ({ error } = await supabase.from('category_groups').update({ name, sort_order }).eq('id', id));
  } else {
    ({ error } = await supabase.from('category_groups').insert([{ name, sort_order }]));
  }

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function deleteGroupAction(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from('category_groups').delete().eq('id', id);
  revalidatePath('/admin/categories');
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function saveCategoryAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient();
  const id = formData.get('id') as string | null;
  const name = (formData.get('name') as string).trim();
  const icon = (formData.get('icon') as string).trim() || '📦';
  const group_id = (formData.get('group_id') as string) || null;
  const sort_order = parseInt(formData.get('sort_order') as string) || 0;

  if (!name) return { error: 'Category name is required.' };

  const payload = { name, icon, group_id, sort_order };

  let error;
  if (id) {
    ({ error } = await supabase.from('business_categories').update(payload).eq('id', id));
  } else {
    ({ error } = await supabase.from('business_categories').insert([payload]));
  }

  if (error) {
    if (error.code === '23505') return { error: `Category "${name}" already exists.` };
    return { error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/members');
  redirect('/admin/categories');
}

export async function deleteCategoryAction(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from('business_categories').delete().eq('id', id);
  revalidatePath('/admin/categories');
  revalidatePath('/members');
}
