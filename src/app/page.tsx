'use client';

import { useState } from 'react';
import Image from "next/image";
import { ThemeToggle } from '@/components/ThemeToggle';
import { WikiReader } from '@/components/WikiReader';

export default function Home() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    totpCode: ''
  });
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<object | null>(null);
  const [tokenValidation, setTokenValidation] = useState<object | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [mathResult, setMathResult] = useState<object | null>(null);
  const [mathLoading, setMathLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [mathParams, setMathParams] = useState({
    operation: 'add',
    a: '1',
    b: '1'
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
        alert('Login successful!');
      } else {
        alert(`Login failed: ${data.error}`);
      }
    } catch {
      alert('Login failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data.data);
    } catch {
      alert('Health check failed');
    }
  };

  const validateToken = async () => {
    if (!token) {
      alert('Please login first to get a token');
      return;
    }

    setValidatingToken(true);
    try {
      const response = await fetch('/api/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setTokenValidation(data);
      
      if (!data.success) {
        alert(`Token validation failed: ${data.error}`);
      }
    } catch {
      alert('Token validation failed: Network error');
      setTokenValidation({ error: 'Network error' });
    } finally {
      setValidatingToken(false);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      alert('No refresh token available. Please login first.');
      return;
    }

    setRefreshLoading(true);
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
        alert('Token refreshed successfully!');
        setTokenValidation(null); // Clear old validation
      } else {
        alert(`Token refresh failed: ${data.error}`);
      }
    } catch {
      alert('Token refresh failed: Network error');
    } finally {
      setRefreshLoading(false);
    }
  };

  const testMathEndpoint = async () => {
    if (!token) {
      alert('Please login first to get a token');
      return;
    }

    setMathLoading(true);
    try {
      const queryParams = new URLSearchParams({
        operation: mathParams.operation,
        a: mathParams.a,
        b: mathParams.b
      });

      const response = await fetch(`/api/demo/math?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setMathResult(data);
      
      if (!data.success) {
        alert(`Math operation failed: ${data.error}`);
      }
    } catch {
      alert('Math operation failed: Network error');
      setMathResult({ error: 'Network error' });
    } finally {
      setMathLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-4">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={120}
              height={25}
              priority
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-foreground">API Starter</h1>
              <p className="text-sm text-muted-foreground">JWT Auth & 2FA</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Next.js API Starter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A production-ready API with JWT authentication, 2FA support, and comprehensive documentation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Authentication Section */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6 text-card-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary">🔐</span>
              </div>
              Authentication
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  2FA Code
                </label>
                <input
                  type="text"
                  value={credentials.totpCode}
                  onChange={(e) => setCredentials({...credentials, totpCode: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            {token && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">🔑</span>
                    Access Token
                  </h3>
                  <code className="text-xs bg-green-100 dark:bg-green-900/40 p-3 rounded block break-all font-mono text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800">
                    {token}
                  </code>
                </div>
                
                {refreshToken && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">🔄</span>
                      Refresh Token
                    </h3>
                    <code className="text-xs bg-blue-100 dark:bg-blue-900/40 p-3 rounded block break-all font-mono text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800">
                      {refreshToken}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* API Testing Section */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6 text-card-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary">📊</span>
              </div>
              API Testing
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={checkHealth}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-md transition-colors duration-200 font-medium"
              >
                Check API Health
              </button>

              <button
                onClick={validateToken}
                disabled={validatingToken || !token}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-muted disabled:text-muted-foreground text-white py-2.5 px-4 rounded-md disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {validatingToken ? 'Validating Token...' : 'Validate JWT Token'}
              </button>

              <button
                onClick={refreshAccessToken}
                disabled={refreshLoading || !refreshToken}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground text-white py-2.5 px-4 rounded-md disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {refreshLoading ? 'Refreshing Token...' : '🔄 Refresh Access Token'}
              </button>
              
              {healthStatus && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">❤️</span>
                    Health Status
                  </h3>
                  <pre className="text-xs bg-green-100 dark:bg-green-900/40 p-3 rounded overflow-auto font-mono text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}

              {tokenValidation && (
                <div className={`p-4 rounded-lg ${
                  (tokenValidation as Record<string, unknown>).success 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <h3 className={`font-medium mb-2 flex items-center gap-2 ${
                    (tokenValidation as Record<string, unknown>).success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    <span className={`${
                      (tokenValidation as Record<string, unknown>).success 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(tokenValidation as Record<string, unknown>).success ? '✅' : '❌'}
                    </span>
                    Token Validation
                  </h3>
                  <pre className={`text-xs p-3 rounded overflow-auto font-mono border ${
                    (tokenValidation as Record<string, unknown>).success 
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800' 
                      : 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800'
                  }`}>
                    {JSON.stringify(tokenValidation, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="pt-2 space-y-2">
                <a
                  href="/docs"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2.5 px-4 rounded-md transition-colors duration-200 font-medium"
                >
                  📚 Documentation
                </a>
                <a
                  href="/api-docs"
                  className="block w-full bg-slate-600 hover:bg-slate-700 text-white text-center py-2.5 px-4 rounded-md transition-colors duration-200 font-medium"
                >
                  🔧 API Reference (Swagger)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Endpoints Section */}
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-6 text-card-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary">🧮</span>
            </div>
            Demo Endpoints
          </h2>
          
          <div className="space-y-6">
            {/* Math Demo */}
            <div>
              <h3 className="text-lg font-medium text-card-foreground mb-4">Math Operations Demo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Operation</label>
                  <select
                    value={mathParams.operation}
                    onChange={(e) => setMathParams({...mathParams, operation: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="add">Addition (+)</option>
                    <option value="subtract">Subtraction (-)</option>
                    <option value="multiply">Multiplication (*)</option>
                    <option value="divide">Division (/)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Number A</label>
                  <input
                    type="number"
                    value={mathParams.a}
                    onChange={(e) => setMathParams({...mathParams, a: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="First number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Number B</label>
                  <input
                    type="number"
                    value={mathParams.b}
                    onChange={(e) => setMathParams({...mathParams, b: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Second number"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={testMathEndpoint}
                    disabled={mathLoading || !token}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-muted disabled:text-muted-foreground text-white py-2 px-4 rounded-md disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {mathLoading ? 'Computing...' : 'Calculate'}
                  </button>
                </div>
              </div>
              
              {mathResult && (
                <div className={`p-4 rounded-lg ${
                  (mathResult as Record<string, unknown>).success 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${
                    (mathResult as Record<string, unknown>).success 
                      ? 'text-orange-800 dark:text-orange-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    <span className={`${
                      (mathResult as Record<string, unknown>).success 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(mathResult as Record<string, unknown>).success ? '🧮' : '❌'}
                    </span>
                    Math Result
                  </h4>
                  <pre className={`text-xs p-3 rounded overflow-auto font-mono border ${
                    (mathResult as Record<string, unknown>).success 
                      ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800' 
                      : 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800'
                  }`}>
                    {JSON.stringify(mathResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Getting Started Info */}
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-card-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary">🚀</span>
            </div>
            Getting Started
          </h3>
          <div className="text-sm text-muted-foreground">
            <p className="mb-4 font-medium text-card-foreground">To test the API:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Configure your credentials in the .env.local file</li>
              <li>Set up 2FA using Google Authenticator with your secret key</li>
              <li>Use the login form above to authenticate</li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                💡 Check the documentation for complete setup instructions and security best practices.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wiki Reader */}
      <WikiReader />
    </div>
  );
}
