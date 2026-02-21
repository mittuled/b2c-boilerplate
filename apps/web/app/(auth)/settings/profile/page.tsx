'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, supabase } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    if (data) {
      setDisplayName(data.display_name);
      setBio(data.bio ?? '');
      setTimezone(data.timezone);
      setLanguage(data.preferred_language);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName,
      bio: bio || null,
      timezone,
      preferred_language: language,
    }).eq('id', user!.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      {saved && <p role="status" className="mt-2 text-sm text-green-600">Profile updated successfully</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium">Display name</label>
          <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} required aria-required="true" className="mt-1 block w-full rounded-md border px-3 py-2" />
          <p className="mt-1 text-xs text-gray-500">{displayName.length}/100</p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2" />
          <p className="mt-1 text-xs text-gray-500">{bio.length}/500</p>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium">Timezone</label>
          <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium">Preferred language</label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <p className="mt-1 text-sm text-gray-600">{user?.email}</p>
          <Link href="/settings/profile/change-email" className="text-sm text-blue-600 hover:text-blue-500">Change email</Link>
        </div>

        <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </main>
  );
}
