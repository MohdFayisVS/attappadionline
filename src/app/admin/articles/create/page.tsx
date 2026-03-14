'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './createArticle.module.css';
import { getCategories, createArticle } from '../actions';
import { uploadLogo } from '../../settings/actions'; // Reusing logo upload for cover image

export default function CreateArticle() {
  const router = useRouter();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const res = await getCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setCategoryId(res.categories[0].id);
        }
      }
    }
    loadCategories();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Auto generate basic slug
    if (!slug || slug === title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (published: boolean) => {
    setIsLoading(true);
    setError('');

    try {
      if (!title || !slug || !content || !categoryId) {
        setError('Please fill in Title, Slug, Content, and Category');
        setIsLoading(false);
        return;
      }

      let finalImageUrl = '';

      if (coverImageFile) {
        const formData = new FormData();
        formData.append('file', coverImageFile);
        const uploadRes = await uploadLogo(formData);
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          setError('Failed to upload image cover');
          setIsLoading(false);
          return;
        }
      }

      const res = await createArticle({
        title,
        slug,
        content,
        excerpt,
        coverImage: finalImageUrl,
        categoryId,
        published
      });

      if (res.success) {
        router.push('/admin/articles');
        router.refresh();
      } else {
        setError(res.error || 'Failed to save article');
      }

    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/articles" className={styles.backBtn}>← Back</Link>
          <h1 className={styles.pageTitle}>Create New Article</h1>
        </div>
        <div className={styles.actions}>
          <button 
            className={`btn ${styles.btnDraft}`} 
            onClick={() => handleSave(false)}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={isLoading}
          >
            {isLoading ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className={styles.editorGrid}>
        {/* Main Editor Area */}
        <div className={styles.mainColumn}>
          <div className={styles.fieldGroup}>
            <label>Title</label>
            <input 
              type="text" 
              className={styles.inputLg} 
              placeholder="Enter article title..." 
              value={title}
              onChange={handleTitleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Content</label>
            <div className={styles.richTextEditor}>
              <textarea 
                className={styles.editorArea} 
                style={{ minHeight: '400px', width: '100%', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="Write your article content here (HTML supported)..."
                value={content}
                onChange={e => setContent(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <div className={styles.panel}>
            <h3>SEO Settings</h3>
            <div className={styles.fieldGroup}>
              <label>Excerpt / Meta Description</label>
              <textarea 
                className={styles.input} 
                rows={3} 
                placeholder="Brief summary..."
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sidebar Settings Area */}
        <div className={styles.sidebarColumn}>
          <div className={styles.panel}>
            <h3>Configuration</h3>
            <div className={styles.fieldGroup}>
              <label>URL Slug</label>
              <input 
                type="text" 
                className={styles.input} 
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
            </div>
            
            <div className={styles.fieldGroup}>
              <label>Category</label>
              <select 
                className={styles.input}
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                {categories.length === 0 && <option value="">No categories...</option>}
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.panel}>
            <h3>Featured Image</h3>
            <div className={styles.imageUpload}>
              <label className={styles.uploadBox} style={{ display: 'block', cursor: 'pointer', textAlign: 'center', padding: '2rem', border: '2px dashed #ccc' }}>
                {coverImagePreview ? (
                  <img src={coverImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                ) : (
                  <span>Click to upload image</span>
                )}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
