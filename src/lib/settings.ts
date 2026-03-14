import fs from 'fs';
import path from 'path';

export interface LogoSettings {
  type: 'text' | 'image';
  text: string;
  imageUrl: string;
}

export interface SiteSettings {
  headerLogo: LogoSettings;
  footerLogo: LogoSettings;
  aiAutoPublish: boolean;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'settings.json');

// Default settings if the file doesn't exist or is invalid
const defaultSettings: SiteSettings = {
  headerLogo: {
    type: 'text',
    text: 'Attappadi Online',
    imageUrl: '',
  },
  footerLogo: {
    type: 'text',
    text: 'Attappadi Online',
    imageUrl: '',
  },
  aiAutoPublish: false,
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    let exists = false;
    try {
      exists = fs.existsSync(SETTINGS_FILE_PATH);
    } catch (err) {
      exists = false;
    }

    if (!exists) {
      try {
        await saveSettings(defaultSettings);
      } catch (err) {
        // Silently ignore in production serverless where fs is Read-Only
      }
      return defaultSettings;
    }

    const fileContent = await fs.promises.readFile(SETTINGS_FILE_PATH, 'utf8');
    const parsedData = JSON.parse(fileContent);
    
    // Merge defaults with saved data to ensure all fields exist
    return {
      ...defaultSettings,
      ...parsedData,
    };
  } catch (error) {
    console.error('Failed to read settings file:', error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  try {
    // Ensure the data directory exists
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(
      SETTINGS_FILE_PATH,
      JSON.stringify(settings, null, 2),
      'utf8'
    );
  } catch (error) {
    console.error('Failed to write settings file (expected in serverless):', error);
    // Do not throw an error, otherwise it crashes the entire website Render Tree
  }
}
