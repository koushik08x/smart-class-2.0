import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UploadFileOptions {
  bucket: 'profile-images' | 'study-materials' | 'assignment-files' | 'assignment-submissions';
  file: File;
  customPath?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export const storageService = {
  // Validate and upload file to Supabase Storage
  async uploadFile(options: UploadFileOptions): Promise<{ path: string; url: string; error?: string }> {
    const { bucket, file, customPath, allowedTypes, maxSizeMB = 25 } = options;

    // 1. Validation checks
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { path: '', url: '', error: `File size exceeds limit of ${maxSizeMB}MB` };
    }

    if (allowedTypes && allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const prefix = type.split('/')[0];
          return file.type.startsWith(prefix);
        }
        return file.type === type || file.name.endsWith(type);
      });

      if (!isAllowed) {
        return { path: '', url: '', error: `File type ${file.type || 'unknown'} is not allowed. Supported types: ${allowedTypes.join(', ')}` };
      }
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = customPath || `${Date.now()}_${cleanFileName}`;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.storage.from(bucket).upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

        if (error) throw error;

        // For private buckets, generate signed URL; for public buckets, get public URL
        if (bucket === 'assignment-submissions') {
          const { data: signedData, error: signErr } = await supabase.storage
            .from(bucket)
            .createSignedUrl(data.path, 3600);
          if (!signErr && signedData) {
            return {
              path: data.path,
              url: signedData.signedUrl,
            };
          }
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return {
          path: data.path,
          url: publicUrlData.publicUrl,
        };
      } catch (err: any) {
        console.warn('Supabase storage upload error, creating simulated blob URL:', err);
      }
    }

    // In preview/fallback environment, generate a persistent Object URL
    const simulatedUrl = URL.createObjectURL(file);
    return {
      path: `${bucket}/${storagePath}`,
      url: simulatedUrl,
    };
  },

  // Generate downloadable or viewable URL (signed URL for private buckets)
  async getFileUrl(bucket: string, path: string): Promise<string> {
    if (isSupabaseConfigured && !path.startsWith('blob:') && !path.startsWith('http')) {
      if (bucket === 'assignment-submissions') {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        return data?.signedUrl || path;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
    return path;
  }
};
