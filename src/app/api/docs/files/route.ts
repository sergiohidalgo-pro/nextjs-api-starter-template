import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    const filePath = searchParams.get('path') || '/';
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'File parameter is required' },
        { status: 400 }
      );
    }

    // Mapping de archivos disponibles
    const fileMap: Record<string, string> = {
      'README.md': join(process.cwd(), 'README.md'),
      'QUICKSTART.md': join(process.cwd(), 'QUICKSTART.md'),
      'DEVELOPER-SETUP.md': join(process.cwd(), 'DEVELOPER-SETUP.md'),
      'MONGODB-SETUP.md': join(process.cwd(), 'MONGODB-SETUP.md'),
      'DOCKER.md': join(process.cwd(), 'DOCKER.md'),
      'JWT.md': join(process.cwd(), 'docs', 'JWT.md'),
      'SECURITY.md': join(process.cwd(), 'docs', 'SECURITY.md'),
      'SETUP.md': join(process.cwd(), 'docs', 'SETUP.md'),
    };

    const actualFilePath = fileMap[fileName];
    
    if (!actualFilePath) {
      return new NextResponse(
        `# ${fileName}\n\nDocumentation file not found in the repository.\n\n*This file will be available when connected to the GitHub repository.*`,
        { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        }
      );
    }

    try {
      const content = readFileSync(actualFilePath, 'utf8');
      return new NextResponse(content, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch {
      // Fallback content si el archivo no existe
      return new NextResponse(
        `# ${fileName}\n\nThis documentation file will be loaded from the GitHub repository.\n\n## Coming Soon\n\nThis file exists in the project structure but is not yet available through the documentation API.\n\n**File location:** \`${filePath}/${fileName}\`\n\n---\n\n*To enable real-time documentation loading, configure the GitHub API integration in your environment variables.*`,
        { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        }
      );
    }
  } catch (error) {
    console.error('Error loading documentation file:', error);
    return NextResponse.json(
      { error: 'Failed to load documentation file' },
      { status: 500 }
    );
  }
}