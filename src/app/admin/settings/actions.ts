'use server';

import { revalidatePath } from 'next/cache';
import { getSettings, saveSettings, LogoSettings } from '@/lib/settings';
import { writeFile } from 'fs/promises';
import path from 'path';

// Added Server Action to fetch settings without importing `fs` in the client
export async function getSettingsAction() {
  return await getSettings();
}

export async function updateSiteSettings(
  headerType: 'text' | 'image',
  headerText: string,
  headerImageUrl: string,
  footerType: 'text' | 'image',
  footerText: string,
  footerImageUrl: string,
  aiAutoPublish: boolean
) {
  try {
    const currentSettings = await getSettings();

    const newSettings = {
      ...currentSettings,
      headerLogo: {
        type: headerType,
        text: headerText,
        imageUrl: headerImageUrl,
      },
      footerLogo: {
        type: footerType,
        text: footerText,
        imageUrl: footerImageUrl,
      },
      aiAutoPublish,
    };

    await saveSettings(newSettings);
    
    // Revalidate the entire site so the new settings apply everywhere
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename simply using timestamp
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);

    // Save the file
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading logo:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}
