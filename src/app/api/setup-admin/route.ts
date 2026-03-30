import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = 'admin@attappadionline.com';
    const plainPassword = 'password123';
    
    // Check if the database works and if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: `Admin user ${email} already exists! You can log in now.` 
      });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully created admin user! Email: ${user.email} | Password: ${plainPassword}` 
    });

  } catch (error: any) {
    console.error('Setup Admin Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create user',
      details: 'Check Netlify logs for Prisma connection issues'
    }, { status: 500 });
  }
}
