import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY'
});

const parser = new Parser();

// We will use Google News RSS search for 'അട്ടപ്പാടി'
const RSS_FEED_URL = 'https://news.google.com/rss/search?q=%E0%B4%85%E0%B4%9F%E0%B5%8D%E0%B4%9F%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B4%BE%E0%B4%9F%E0%B4%BF&hl=ml&gl=IN&ceid=IN:ml';

export async function GET(req: Request) {
  // 1. Verify cron authorization (Basic security for Vercel Cron)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Check if Auto-Publishing is enabled in the Admin Dashboard
    const settings = await getSettings();
    if (!settings.aiAutoPublish) {
      return NextResponse.json({ message: 'AI Auto-Publishing is currently disabled in settings.' });
    }

    // 3. Check for API Key
    if (!process.env.GEMINI_API_KEY) {
       console.warn("GEMINI_API_KEY is missing. Aborting run.");
       return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    // 4. Fetch the latest news from RSS
    const feed = await parser.parseURL(RSS_FEED_URL);
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ message: 'No articles found in RSS feed.' });
    }

    const topItem = feed.items[0];
    const rawContent = topItem.contentSnippet || topItem.content || topItem.title || '';

    // 5. Request Gemini to rewrite the content into JSON
    const prompt = `
      You are an expert Malayalam journalist for "Attappadi Online".
      Read the following news snippet about Attappadi:
      "${rawContent}"

      Task: Write a complete, professional, and entirely original news article in Malayalam based on this information. Expand on it professionally. Do NOT copy the original text to avoid plagiarism.
      
      Output exactly as a raw JSON object (no markdown formatting, no text before or after, no \`\`\`json) with exactly the following keys:
      {
        "title": "A catchy Malayalam headline",
        "excerpt": "A 2-sentence summary in Malayalam",
        "content": "The full article content formatted elegantly in HTML. DO NOT USE newlines, JUST HTML tags natively.",
        "categoryName": "General" 
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text || '{}';
    const cleanedText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedArticle = JSON.parse(cleanedText);

    // 6. Find or Create Category
    let category = await prisma.category.findFirst({
      where: { name: parsedArticle.categoryName || 'General' }
    });

    if (!category) {
      category = await prisma.category.findFirstOrThrow();
    }

    // 7. Find Admin Author
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) throw new Error('No admin user found to author the AI article.');

    // 8. Generate Slug
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const finalSlug = `auto-news-${randomSuffix}`;

    // 9. Save to Database
    const newArticle = await prisma.article.create({
      data: {
        title: parsedArticle.title || 'Breaking News',
        slug: finalSlug,
        excerpt: parsedArticle.excerpt || '',
        content: parsedArticle.content || '<p>News content coming shortly.</p>',
        published: true,
        authorId: admin.id,
        categoryId: category.id,
        coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop', // Default placeholder
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Article successfully scraped, generated, and published!',
      articleId: newArticle.id 
    });

  } catch (error) {
     console.error("Cron Job Error:", error);
     return NextResponse.json({ error: 'Failed to process AI news run.' + (error as Error).message }, { status: 500 });
  }
}
