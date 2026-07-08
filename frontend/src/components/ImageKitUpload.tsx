'use client';

import { useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { Upload, Loader2, CheckCircle2, X } from 'lucide-react';

interface ImageKitUploadProps {
  /** Label shown above the uploader */
  label?: string;
  /** Current image URL (controlled) */
  value?: string;
  /** Called when upload completes and the new URL is ready */
  onChange: (url: string) => void;
  /** Subfolder in your ImageKit media library */
  folder?: string;
  /** Show a live preview thumbnail below? */
  showPreview?: boolean;
  /** Validation error message */
  error?: string;
}

const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const PUBLIC_KEY   = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

/** Fetches short-lived auth params signed by the backend (private key never leaves server). */
async function getAuthParams(): Promise<{ token: string; expire: string; signature: string }> {
  const jwtToken = Cookies.get('token') ?? '';

  const res = await fetch('/api/admin/imagekit/auth', {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  if (!res.ok) throw new Error('ImageKit auth failed');
  return res.json();
}

/** Uploads a file directly to ImageKit using their Upload REST API. */
async function uploadToImageKit(file: File, folder: string): Promise<string> {
  const { token, expire, signature } = await getAuthParams();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('folder', folder);
  formData.append('publicKey', PUBLIC_KEY);
  formData.append('signature', signature);
  formData.append('expire', expire);
  formData.append('token', token);

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed');
  }

  const data = await res.json();
  return data.url as string;
}

export default function ImageKitUpload({
  label,
  value,
  onChange,
  folder = '/devcraft',
  showPreview = true,
  error,
}: ImageKitUploadProps) {
  const fileInputRef             = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded,  setUploaded]  = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploaded(false);
    setUploadErr('');

    try {
      const url = await uploadToImageKit(file, folder);
      onChange(url);
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
    } catch (err: any) {
      console.error('ImageKit upload error', err);
      setUploadErr(err.message || 'Upload failed — please try again.');
    } finally {
      setUploading(false);
      // reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayError = error || uploadErr;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-navy-900 mb-1.5">{label}</label>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Clickable upload area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors select-none
          ${uploading ? 'cursor-wait' : 'cursor-pointer'}
          ${displayError
            ? 'border-red-400 bg-red-50'
            : uploaded
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-gray-50 hover:border-[#00668a] hover:bg-blue-50/30'
          }`}
      >
        {uploading ? (
          <Loader2 size={18} className="text-[#00668a] animate-spin flex-shrink-0" />
        ) : uploaded ? (
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
        ) : (
          <Upload size={18} className="text-gray-400 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {uploading ? (
            <p className="text-sm text-[#00668a] font-medium">Uploading…</p>
          ) : uploaded ? (
            <p className="text-sm text-green-600 font-medium">Upload complete!</p>
          ) : value ? (
            <p className="text-xs text-gray-500 truncate font-mono">{value}</p>
          ) : (
            <p className="text-sm text-gray-400">
              Click to upload <span className="text-xs text-gray-300">(PNG, JPG, WEBP)</span>
            </p>
          )}
        </div>

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setUploaded(false);
              setUploadErr('');
            }}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove image"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {displayError && (
        <p className="text-red-500 text-xs mt-1">{displayError}</p>
      )}

      {/* Live preview */}
      {showPreview && value && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
