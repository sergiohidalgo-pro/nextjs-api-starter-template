'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface DocFile {
  name: string;
  content: string;
  path: string;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('README.md');
  const [loading, setLoading] = useState(true);

  // Simulated docs structure - en producción vendría de tu repo GitHub
  const docFiles = [
    { name: 'README.md', path: '/' },
    { name: 'QUICKSTART.md', path: '/' },
    { name: 'DEVELOPER-SETUP.md', path: '/' },
    { name: 'MONGODB-SETUP.md', path: '/' },
    { name: 'DOCKER.md', path: '/' },
    { name: 'JWT.md', path: '/docs' },
    { name: 'SECURITY.md', path: '/docs' },
    { name: 'SETUP.md', path: '/docs' },
  ];

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const loadedDocs: DocFile[] = [];
        
        for (const docFile of docFiles) {
          try {
            // Simula cargar desde GitHub API
            const response = await fetch(`/api/docs/files?file=${docFile.name}&path=${docFile.path}`);
            const content = await response.text();
            
            loadedDocs.push({
              name: docFile.name,
              content: content || `# ${docFile.name}\n\nDocumentation file not found.`,
              path: docFile.path
            });
          } catch {
            // Fallback content si no se puede cargar
            loadedDocs.push({
              name: docFile.name,
              content: `# ${docFile.name}\n\nThis documentation will be loaded from GitHub repository.\n\n*Coming soon...*`,
              path: docFile.path
            });
          }
        }
        
        setDocs(loadedDocs);
      } catch (error) {
        console.error('Failed to load documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, []);

  const getCurrentDoc = () => {
    return docs.find(doc => doc.name === selectedDoc) || docs[0];
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Documentation...</p>
        </div>
      </div>
    );
  }

  const currentDoc = getCurrentDoc();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">cl-donlee-api</h1>
              <p className="text-gray-600 mt-1">v1.0.0 • Documentation</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/api-docs"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                API Reference
              </a>
              <a
                href="https://github.com/your-username/cl-donlee-api"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Documentation</h3>
              <nav className="space-y-1">
                {docFiles.map((docFile) => (
                  <button
                    key={docFile.name}
                    onClick={() => setSelectedDoc(docFile.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedDoc === docFile.name
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{docFile.name}</span>
                    </div>
                    {docFile.path !== '/' && (
                      <div className="text-xs text-gray-400 ml-6">{docFile.path}</div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* File header */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-lg font-medium text-gray-900">{currentDoc?.name}</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-8">
                <div 
                  className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-code:text-pink-600 prose-pre:bg-gray-100"
                  dangerouslySetInnerHTML={renderMarkdown(currentDoc?.content || '')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}