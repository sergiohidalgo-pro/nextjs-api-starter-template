'use client';

import { useState } from 'react';
import Image from "next/image";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <Image
            className="mx-auto mb-4 drop-shadow-sm"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Cl-init-api-nextjs API</h1>
          <p className="text-lg text-blue-200">Next.js API with JWT Authentication & 2FA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Authentication Section */}
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-blue-200/30 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-blue-600">🔐</span>
              Authentication
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white focus:bg-white shadow-sm"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white focus:bg-white shadow-sm"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  2FA Code
                </label>
                <input
                  type="text"
                  value={credentials.totpCode}
                  onChange={(e) => setCredentials({...credentials, totpCode: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white focus:bg-white shadow-sm"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            {token && (
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="text-emerald-600">🔑</span>
                    Access Token:
                  </h3>
                  <code className="text-xs bg-emerald-100 p-3 rounded-lg block break-all font-mono text-emerald-900 font-medium border border-emerald-200">
                    {token}
                  </code>
                </div>
                
                {refreshToken && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">🔄</span>
                      Refresh Token:
                    </h3>
                    <code className="text-xs bg-blue-100 p-3 rounded-lg block break-all font-mono text-blue-900 font-medium border border-blue-200">
                      {refreshToken}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* API Testing Section */}
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-purple-200/30 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-purple-600">📊</span>
              API Testing
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={checkHealth}
                className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Check API Health
              </button>

              <button
                onClick={validateToken}
                disabled={validatingToken || !token}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {validatingToken ? 'Validating Token...' : 'Validate JWT Token'}
              </button>

              <button
                onClick={refreshAccessToken}
                disabled={refreshLoading || !refreshToken}
                className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {refreshLoading ? 'Refreshing Token...' : '🔄 Refresh Access Token'}
              </button>
              
              {healthStatus && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="text-emerald-600">❤️</span>
                    Health Status:
                  </h3>
                  <pre className="text-xs bg-emerald-100 p-3 rounded-lg overflow-auto font-mono text-emerald-900 font-medium border border-emerald-200">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}

              {tokenValidation && (
                <div className={`p-4 rounded-lg shadow-sm ${
                  (tokenValidation as Record<string, unknown>).success 
                    ? 'bg-emerald-50 border border-emerald-200' 
                    : 'bg-rose-50 border border-rose-200'
                }`}>
                  <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
                    (tokenValidation as Record<string, unknown>).success 
                      ? 'text-emerald-800' 
                      : 'text-rose-800'
                  }`}>
                    <span className={`${
                      (tokenValidation as Record<string, unknown>).success 
                        ? 'text-emerald-600' 
                        : 'text-rose-600'
                    }`}>
                      {(tokenValidation as Record<string, unknown>).success ? '✅' : '❌'}
                    </span>
                    Token Validation Result:
                  </h3>
                  <pre className={`text-xs p-3 rounded-lg overflow-auto font-mono font-medium border ${
                    (tokenValidation as Record<string, unknown>).success 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-200' 
                      : 'bg-rose-100 text-rose-900 border-rose-200'
                  }`}>
                    {JSON.stringify(tokenValidation, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="space-y-2">
                <a
                  href="/docs"
                  className="block w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white text-center py-3 px-4 rounded-lg hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  View API Documentation (Swagger)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Endpoints Section */}
        <div className="mt-8 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-orange-200/30 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span className="text-orange-600">🧮</span>
            Demo Endpoints
          </h2>
          
          <div className="space-y-6">
            {/* Math Demo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Math Operations Demo</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Operation</label>
                  <select
                    value={mathParams.operation}
                    onChange={(e) => setMathParams({...mathParams, operation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="add">Addition (+)</option>
                    <option value="subtract">Subtraction (-)</option>
                    <option value="multiply">Multiplication (*)</option>
                    <option value="divide">Division (/)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Number A</label>
                  <input
                    type="number"
                    value={mathParams.a}
                    onChange={(e) => setMathParams({...mathParams, a: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="First number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Number B</label>
                  <input
                    type="number"
                    value={mathParams.b}
                    onChange={(e) => setMathParams({...mathParams, b: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Second number"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={testMathEndpoint}
                    disabled={mathLoading || !token}
                    className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:via-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {mathLoading ? 'Computing...' : 'Calculate'}
                  </button>
                </div>
              </div>
              
              {mathResult && (
                <div className={`p-4 rounded-lg shadow-sm ${
                  (mathResult as Record<string, unknown>).success 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'bg-rose-50 border border-rose-200'
                }`}>
                  <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                    (mathResult as Record<string, unknown>).success 
                      ? 'text-orange-800' 
                      : 'text-rose-800'
                  }`}>
                    <span className={`${
                      (mathResult as Record<string, unknown>).success 
                        ? 'text-orange-600' 
                        : 'text-rose-600'
                    }`}>
                      {(mathResult as Record<string, unknown>).success ? '🧮' : '❌'}
                    </span>
                    Math Result:
                  </h4>
                  <pre className={`text-xs p-3 rounded-lg overflow-auto font-mono font-medium border ${
                    (mathResult as Record<string, unknown>).success 
                      ? 'bg-orange-100 text-orange-900 border-orange-200' 
                      : 'bg-rose-100 text-rose-900 border-rose-200'
                  }`}>
                    {JSON.stringify(mathResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Getting Started Info */}
        <div className="mt-8 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-indigo-200/30 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">🚀</span>
            Getting Started
          </h3>
          <div className="text-sm text-slate-700">
            <p className="mb-3 font-medium">To test the API:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Configure your credentials in the .env.local file</li>
              <li>Set up 2FA using Google Authenticator with your secret key</li>
              <li>Use the login form above to authenticate</li>
            </ul>
            <p className="mt-4 text-xs bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
              💡 Check the documentation for complete setup instructions and security best practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
