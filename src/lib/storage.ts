import { supabase } from './supabase';

export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const urlParts = url.split('/portfolio-images/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from('portfolio-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}
