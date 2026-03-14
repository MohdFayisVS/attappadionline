'use client';

import { useState, useEffect } from 'react';
import { updateSiteSettings, uploadLogo, getSettingsAction } from './actions';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // General State
  const [aiAutoPublish, setAiAutoPublish] = useState(false);

  // Header State
  const [headerType, setHeaderType] = useState<'text' | 'image'>('text');
  const [headerText, setHeaderText] = useState('Attappadi Online');
  const [headerImagePreview, setHeaderImagePreview] = useState('');
  const [headerFile, setHeaderFile] = useState<File | null>(null);

  // Footer State
  const [footerType, setFooterType] = useState<'text' | 'image'>('text');
  const [footerText, setFooterText] = useState('Attappadi Online');
  const [footerImagePreview, setFooterImagePreview] = useState('');
  const [footerFile, setFooterFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSettingsAction();
        
        setAiAutoPublish(settings.aiAutoPublish);

        setHeaderType(settings.headerLogo.type);
        setHeaderText(settings.headerLogo.text);
        setHeaderImagePreview(settings.headerLogo.imageUrl);

        setFooterType(settings.footerLogo.type);
        setFooterText(settings.footerLogo.text);
        setFooterImagePreview(settings.footerLogo.imageUrl);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderFile(file);
      setHeaderImagePreview(URL.createObjectURL(file));
      setHeaderType('image'); // Auto switch back if they upload
    }
  };

  const handleFooterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFooterFile(file);
      setFooterImagePreview(URL.createObjectURL(file));
      setFooterType('image');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      let finalHeaderImg = headerImagePreview;
      let finalFooterImg = footerImagePreview;

      // Upload Header Image if there's a new file
      if (headerFile) {
        const formData = new FormData();
        formData.append('file', headerFile);
        const uploadResult = await uploadLogo(formData);
        if (uploadResult.success && uploadResult.url) {
          finalHeaderImg = uploadResult.url;
          setHeaderImagePreview(finalHeaderImg); // update the URL
        }
      }

      // Upload Footer Image if there's a new file
      if (footerFile) {
        const formData = new FormData();
        formData.append('file', footerFile);
        const uploadResult = await uploadLogo(formData);
        if (uploadResult.success && uploadResult.url) {
          finalFooterImg = uploadResult.url;
          setFooterImagePreview(finalFooterImg);
        }
      }

      // Save Data
      const result = await updateSiteSettings(
        headerType,
        headerText,
        finalHeaderImg,
        footerType,
        footerText,
        finalFooterImg,
        aiAutoPublish
      );

      if (result.success) {
        setMessage('Settings saved successfully!');
        setHeaderFile(null); // Reset File object so we don't upload again
        setFooterFile(null);
      } else {
        setMessage(result.error || 'Unknown error saving settings');
      }

    } catch (e) {
      console.error(e);
      setMessage('An error occurred during save.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading Settings...</div>;

  return (
    <div className="card p-6">
      <h1 className="mb-6 font-bold text-2xl">Site Settings</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg font-medium ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* AI Settings Section */}
        <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-l-4 border-indigo-500">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>✨</span> AI Features
          </h2>
          <div className="flex items-start gap-4 mb-4">
             <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={aiAutoPublish} 
                onChange={(e) => setAiAutoPublish(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
              <div>
                <span className="block font-semibold">Enable Automated AI Publishing</span>
                <span className="block text-sm text-gray-500 max-w-lg">When enabled, the system will periodically gather local news, rewrite it using AI, and publish it automatically without manual intervention.</span>
              </div>
            </label>
          </div>
        </section>


        {/* Header Logo Section */}
        <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Header Logo</h2>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="headerType" 
                value="text" 
                checked={headerType === 'text'} 
                onChange={() => setHeaderType('text')}
                className="accent-primary"
              />
              Text Logo
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="headerType" 
                value="image" 
                checked={headerType === 'image'} 
                onChange={() => setHeaderType('image')}
                className="accent-primary"
              />
              Image Logo
            </label>
          </div>

          {headerType === 'text' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Text Display</label>
              <input 
                type="text" 
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                placeholder="E.g., Attappadi Online"
              />
            </div>
          ) : (
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Upload Logo Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleHeaderFileChange}
                    className="w-full"
                  />
               </div>
               
               {headerImagePreview && (
                <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                  <img src={headerImagePreview} alt="Header Preview" className="max-h-16 object-contain" />
                </div>
               )}
            </div>
          )}
        </section>


        {/* Footer Logo Section */}
        <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Footer Logo</h2>
          <div className="flex gap-4 mb-4">
             <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="footerType" 
                value="text" 
                checked={footerType === 'text'} 
                onChange={() => setFooterType('text')}
                 className="accent-primary"
              />
              Text Logo
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="footerType" 
                value="image" 
                checked={footerType === 'image'} 
                onChange={() => setFooterType('image')}
                 className="accent-primary"
              />
              Image Logo
            </label>
          </div>

          {footerType === 'text' ? (
             <div className="space-y-2">
              <label className="block text-sm font-medium">Text Display</label>
              <input 
                type="text" 
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                placeholder="E.g., Attappadi Online"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Upload Footer Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFooterFileChange}
                    className="w-full"
                  />
               </div>
               
               {footerImagePreview && (
                <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                   <img src={footerImagePreview} alt="Footer Preview" className="max-h-16 object-contain" />
                </div>
               )}
            </div>
          )}
        </section>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn btn-primary min-w-[150px]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
