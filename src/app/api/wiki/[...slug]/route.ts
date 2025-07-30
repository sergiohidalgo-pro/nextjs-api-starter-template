import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const params = await context.params;
    const { slug } = params;
    const filename = slug.join('/');
    
    // Security: Only allow specific markdown files
    const allowedFiles = ['README.md', 'MONGODB-SETUP.md', 'CLAUDE.md'];
    const requestedFile = filename.split('/').pop();
    
    if (!requestedFile || !allowedFiles.includes(requestedFile)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get file path (from project root)
    const filePath = join(process.cwd(), requestedFile);
    
    try {
      const content = await readFile(filePath, 'utf-8');
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (fileError) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Wiki API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}