'use client';

import { useRef, useState } from 'react';
import { IKContext, IKUpload } from 'imagekitio-next';
import { Upload, Loader2, CheckCircle2, X, ImageIcon } from 'lucide-react';

interface ImageKitUploadProps {
  /** Label shown above the uploader */
  label?: string;
  /** Current image URL (controlled) */
  value?: string;
  /** Called when upload completes and the new URL is ready */
  onChange: (url: string) => void;
  /** Optional subfolder in your ImageKit media library */
  folder?: string;
  /** Show a small preview thumbnail? */
  showPreview?: boolean;
  /** Error message to show */
  error?: string;
}

const urlEndpoint  = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey    = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

/**
 * Fetches fresh authentication parameters from our secure backend endpoint.
 * The backend signs the token with the private key — it never leaves the server.
 */
async function authenticator() {
  const res = await fetch('/api/admin/imagekit/auth', {
    headers: {
      Authorization: `Bearer ${document.cookie
        .split('; ')
        .find((c) => c.startsWith('token='))
        ?.split('=')[1] ?? ''}`,
    },
  });
  if (!res.ok) throw new Error('ImageKit auth failed');
  return res.json() as Promise<{ token: string; expire: string; signature: string }>;
}

export default function ImageKitUpload({
  label,
  value,
  onChange,
  folder = '/devcraft',
  showPreview = true,
  error,
}: ImageKitUploadProps) {
  const ikUploadRef = useRef<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState(false);

  const onError = (err: any) => {
    console.error('ImageKit upload error', err);
    setUploading(false);
    alert('Upload failed — please try again.');
  };

  const onSuccess = (res: any) => {
    setUploading(false);
    setUploaded(true);
    onChange(res.url);
    setTimeout(() => setUploaded(false), 3000);
  };

  const onUploadStart = () => {
    setUploading(true);
    setUploaded(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-navy-900 mb-1.5">{label}</label>
      )}

      <IKContext
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={authenticator}
      >
        {/* Hidden IKUpload — triggered programmatically */}
        <IKUpload
          ref={ikUploadRef}
          folder={folder}
          onError={onError}
          onSuccess={onSuccess}
          onUploadStart={onUploadStart}
          style={{ display: 'none' }}
        />
      </IKContext>

      {/* Upload button area */}
      <div
        onClick={() => ikUploadRef.current?.click()}
        className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors
          ${error
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
            <p className="text-sm text-[#00668a] font-medium">Uploading...</p>
          ) : uploaded ? (
            <p className="text-sm text-green-600 font-medium">Upload complete!</p>
          ) : value ? (
            <p className="text-xs text-gray-500 truncate font-mono">{value}</p>
          ) : (
            <p className="text-sm text-gray-400">Click to upload an image</p>
          )}
        </div>

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

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
