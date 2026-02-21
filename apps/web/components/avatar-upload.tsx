'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-provider';

export function AvatarUpload({ currentUrl, userId }: { currentUrl: string | null; userId: string }) {
  const { supabase } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5 MB');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPEG and PNG files are allowed');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);

    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
        {preview && <img src={preview} alt="Avatar" className="h-full w-full object-cover" />}
      </div>
      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleUpload} className="hidden" aria-label="Upload profile photo" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload new photo'}
        </button>
      </div>
    </div>
  );
}
