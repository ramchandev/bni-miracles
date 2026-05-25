import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const metadata: Metadata = { title: 'Contacts — BNI Miracles Admin' };

export default async function ContactsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Contact Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-gray)' }}>
          {contacts?.length ?? 0} messages total
        </p>
      </div>

      {!contacts?.length ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-2">✉️</p>
          <p className="font-semibold" style={{ color: 'var(--color-dark)' }}>No messages yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-bold text-sm" style={{ color: 'var(--color-dark)' }}>{c.name}</span>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <a href={`mailto:${c.email}`} className="text-xs hover:underline" style={{ color: 'var(--color-primary)' }}>{c.email}</a>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="text-xs" style={{ color: 'var(--color-gray)' }}>{c.phone}</a>
                    )}
                  </div>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--color-gray)' }}>
                  {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-gray)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
