import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';

const AdminPanel = () => {
  const { logout } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // 表单状态
  const [apiToken, setApiToken] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setError('Failed to load configuration');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateApiToken = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/config/cloudflare-token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ apiToken }),
      });
      
      if (response.ok) {
        setMessage('Cloudflare API token updated successfully');
        setApiToken('');
        fetchConfig();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update API token');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const updateLoginKey = async (e) => {
    e.preventDefault();
    
    if (newKey !== confirmKey) {
      setError('New keys do not match');
      return;
    }
    
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/config/login-key', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentKey, newKey }),
      });
      
      if (response.ok) {
        setMessage('Login key updated successfully. Please login again.');
        setCurrentKey('');
        setNewKey('');
        setConfirmKey('');
        // 延迟登出，让用户看到成功消息
        setTimeout(() => logout(), 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update login key');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/config/test-cloudflare', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Cloudflare API connection successful');
      } else {
        setError(data.message || 'API connection failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">管理后台</h1>
            
            {message && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {/* Cloudflare API Token 配置 */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cloudflare API Token</h2>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">
                  当前状态: {config?.hasApiToken ? 
                    <span className="text-green-600">已配置 ({config.cloudflareApiToken})</span> : 
                    <span className="text-red-600">未配置</span>
                  }
                </p>
                {config?.lastUpdated && (
                  <p className="text-sm text-gray-500">最后更新: {new Date(config.lastUpdated).toLocaleString()}</p>
                )}
              </div>
              
              <form onSubmit={updateApiToken} className="space-y-4">
                <div>
                  <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700">
                    新的 API Token
                  </label>
                  <input
                    type="password"
                    id="apiToken"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="输入新的 Cloudflare API Token"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={saving || !apiToken}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? '更新中...' : '更新 API Token'}
                  </button>
                  <button
                    type="button"
                    onClick={testApiConnection}
                    disabled={saving || !config?.hasApiToken}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? '测试中...' : '测试连接'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* 登录密钥配置 */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">登录密钥管理</h2>
              <form onSubmit={updateLoginKey} className="space-y-4">
                <div>
                  <label htmlFor="currentKey" className="block text-sm font-medium text-gray-700">
                    当前登录密钥
                  </label>
                  <input
                    type="password"
                    id="currentKey"
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="输入当前登录密钥"
                  />
                </div>
                <div>
                  <label htmlFor="newKey" className="block text-sm font-medium text-gray-700">
                    新登录密钥
                  </label>
                  <input
                    type="password"
                    id="newKey"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="输入新登录密钥"
                  />
                </div>
                <div>
                  <label htmlFor="confirmKey" className="block text-sm font-medium text-gray-700">
                    确认新登录密钥
                  </label>
                  <input
                    type="password"
                    id="confirmKey"
                    value={confirmKey}
                    onChange={(e) => setConfirmKey(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="再次输入新登录密钥"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !currentKey || !newKey || !confirmKey}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? '更新中...' : '更新登录密钥'}
                </button>
              </form>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-between">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回仪表板
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;