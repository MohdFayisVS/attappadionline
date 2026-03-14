'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// --- CATEGORIES ---

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, categories };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function createCategory(name: string, slug: string) {
  try {
    // Only authenticated users can create categories
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    const category = await prisma.category.create({
      data: { name, slug }
    });
    revalidatePath('/admin/categories');
    return { success: true, category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: 'Failed to create category (slug might exist)' };
  }
}

// --- ARTICLES ---

export async function getArticles(published?: boolean) {
  try {
    const whereClause = published !== undefined ? { published } : {};
    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        category: true,
        author: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, articles };
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return { success: false, error: 'Failed to fetch articles' };
  }
}

export async function createArticle(data: {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categoryId: string;
  published: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        published: data.published,
        authorId: session.user.id,
      }
    });

    revalidatePath('/admin/articles');
    revalidatePath('/'); // Revalidate homepage too
    
    return { success: true, article };
  } catch (error) {
    console.error("Failed to create article:", error);
    return { success: false, error: 'Failed to create article (slug might exist)' };
  }
}

export async function deleteArticle(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    await prisma.article.delete({
      where: { id }
    });

    revalidatePath('/admin/articles');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete article:", error);
    return { success: false, error: 'Failed to delete article' };
  }
}
