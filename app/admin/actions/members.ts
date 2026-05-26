'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';

function generateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function saveMemberAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient();
  const id = formData.get('id') as string | null;

  const name = (formData.get('name') as string).trim();
  const slugFromForm = (formData.get('slug') as string).trim();
  const slug = slugFromForm || generateSlug(name);

  const emailRaw = (formData.get('email') as string)?.trim() ?? '';
  let email: string | null = null;
  if (emailRaw) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      return { error: 'Invalid email address.' };
    }
    email = emailRaw.toLowerCase();
  }

  const payload = {
    name,
    slug,
    business_name: (formData.get('business_name') as string).trim(),
    category: formData.get('category') as string,
    phone: (formData.get('phone') as string)?.trim() || null,
    email,
    business_location: (formData.get('business_location') as string)?.trim() || null,
    website: (formData.get('website') as string)?.trim() || null,
    services: (formData.get('services') as string)?.trim() || null,
    why_choose_us: (formData.get('why_choose_us') as string)?.trim() || null,
    success_stories: (formData.get('success_stories') as string)?.trim() || null,
    profile_picture_url: (formData.get('profile_picture_url') as string)?.trim() || null,
    is_active: formData.get('is_active') === 'true',
    updated_at: new Date().toISOString(),
  };

  let memberId = id;
  let error;

  if (id) {
    ({ error } = await supabase.from('members').update(payload).eq('id', id));
  } else {
    const { data, error: insertError } = await supabase
      .from('members')
      .insert([payload])
      .select('id')
      .single();
    error = insertError;
    memberId = data?.id ?? null;
  }

  if (error) {
    if (error.code === '23505') {
      return { error: `Slug "${slug}" is already taken. Please adjust the name or slug.` };
    }
    return { error: error.message };
  }

  // Save gives & asks — delete existing then re-insert
  if (memberId) {
    await supabase.from('member_gives_asks').delete().eq('member_id', memberId);

    const gives = formData.getAll('gives') as string[];
    const asks = formData.getAll('asks') as string[];

    const rows = [
      ...gives.map((item, i) => ({ member_id: memberId, type: 'give' as const, item: item.trim(), sort_order: i })),
      ...asks.map((item, i) => ({ member_id: memberId, type: 'ask' as const, item: item.trim(), sort_order: i })),
    ].filter((r) => r.item.length > 0);

    if (rows.length > 0) {
      await supabase.from('member_gives_asks').insert(rows);
    }
  }

  revalidatePath('/admin/members');
  revalidatePath('/members');
  revalidatePath(`/members/${slug}`);
  revalidatePath('/');
  redirect('/admin/members');
}

export async function toggleMemberActiveAction(id: string, isActive: boolean) {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from('members')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/members');
  revalidatePath('/members');
}

export async function deleteMemberAction(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from('members').delete().eq('id', id);
  revalidatePath('/admin/members');
  revalidatePath('/members');
}
