import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { ApplicationStatus, Scheme, UserScheme, Reminder } from './types';
import { useFocusEffect } from 'expo-router';

export type UserSchemeWithScheme = UserScheme & { scheme: Scheme };

export function useUserSchemes() {
  const [items, setItems] = useState<UserSchemeWithScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_schemes')
      .select('*, scheme:schemes(*)')
      .order('updated_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setItems((data ?? []) as unknown as UserSchemeWithScheme[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, loading, error, refetch: fetch };
}

export function useReminders() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  return { items, loading, refetch: fetch };
}

export async function upsertUserScheme(
  schemeId: string,
  status: ApplicationStatus,
  extra?: Partial<UserScheme>
) {
  const { error } = await supabase
    .from('user_schemes')
    .upsert({ scheme_id: schemeId, status, ...extra }, { onConflict: 'user_id,scheme_id' });
  return { error: error ? error.message : null };
}

export async function updateUserScheme(id: string, patch: Partial<UserScheme>) {
  const { error } = await supabase.from('user_schemes').update(patch).eq('id', id);
  return { error: error ? error.message : null };
}

export async function removeUserScheme(id: string) {
  const { error } = await supabase.from('user_schemes').delete().eq('id', id);
  return { error: error ? error.message : null };
}
