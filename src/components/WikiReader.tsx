'use client';

import { useState, useEffect } from 'react';

interface WikiFile {
  name: string;
  path: string;
  content?: string;
}

const WIKI_FILES: WikiFile[] = [
  { name: 'Project README', path: '/api/wiki/README.md' },
  { name: 'MongoDB Setup', path: '/api/wiki/MONGODB-SETUP.md' },
  { name: 'Project Instructions', path: '/api/wiki/CLAUDE.md' },
];

export function WikiReader() {
  const [selectedFile, setSelectedFile] = useState<WikiFile | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadFile = async (file: WikiFile) => {
    if (file.content) {
      setContent(file.content);
      setSelectedFile(file);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(file.path);
      if (response.ok) {
        const text = await response.text();
        file.content = text;
        setContent(text);
        setSelectedFile(file);
      } else {
        setContent(`# File Not Found\n\nThe file "${file.name}" could not be loaded.`);
      }
    } catch (error) {
      setContent(`# Error Loading File\n\nFailed to load "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4 text-foreground">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1 text-muted-foreground">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 text-muted-foreground">$1</li>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono text-accent-foreground">$1</code>')
      .replace(/```([^```]+)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto mb-4"><code class="text-sm font-mono text-muted-foreground">$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground">')
      .replace(/^\n/, '<p class="mb-4 text-muted-foreground">')
      .concat('</p>');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition-colors duration-200 z-50"
        title="Open Documentation Wiki"
      >
        📚
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto h-full flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-muted border-r border-border p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-card-foreground mb-2">Documentation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Close Wiki
              </button>
            </div>
            
            <ul className="space-y-2">
              {WIKI_FILES.map((file) => (
                <li key={file.path}>
                  <button
                    onClick={() => loadFile(file)}
                    className={`w-full text-left p-2 rounded transition-colors text-sm ${
                      selectedFile?.path === file.path
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {file.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : selectedFile ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: markdownToHtml(content) 
                  }} 
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Documentation Wiki</h2>
                  <p>Select a file from the sidebar to view its contents.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}