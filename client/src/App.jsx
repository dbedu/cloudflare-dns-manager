// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API 基础 URL
const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  // 状态管理
  const [zones, setZones] = useState([]);           // 域名列表
  const [selectedZone, setSelectedZone] = useState(null);  // 当前选中的域名
  const [dnsRecords, setDnsRecords] = useState([]); // DNS 记录列表
  const [isLoading, setIsLoading] = useState(false); // 加载状态
  const [error, setError] = useState(null);         // 错误信息
  const [showModal, setShowModal] = useState(false); // 显示模态框
  const [currentRecord, setCurrentRecord] = useState(null); // 当前编辑的记录
  const [formData, setFormData] = useState({        // 表单数据
    type: 'A',
    name: '',
    content: '',
    ttl: 1,
    proxied: false
  });

  // 组件挂载时获取域名列表
  useEffect(() => {
    const fetchZones = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/zones`);
        if (response.data.success) {
          setZones(response.data.result);
        } else {
          setError('获取域名列表失败');
        }
      } catch (err) {
        setError('获取域名列表时出错: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchZones();
  }, []);

  // 当选中域名变化时获取 DNS 记录
  useEffect(() => {
    const fetchDnsRecords = async () => {
      if (!selectedZone) {
        setDnsRecords([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/zones/${selectedZone.id}/dns_records`);
        if (response.data.success) {
          setDnsRecords(response.data.result);
        } else {
          setError('获取DNS记录失败');
        }
      } catch (err) {
        setError('获取DNS记录时出错: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDnsRecords();
  }, [selectedZone]);

  // 处理域名选择变化
  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    if (!zoneId) {
      setSelectedZone(null);
      return;
    }
    
    const zone = zones.find(z => z.id === zoneId);
    setSelectedZone(zone);
  };

  // 删除 DNS 记录
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('确定要删除这条记录吗?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/zones/${selectedZone.id}/dns_records/${recordId}`);
      // 更新本地记录列表
      setDnsRecords(dnsRecords.filter(record => record.id !== recordId));
    } catch (err) {
      setError('删除记录时出错: ' + err.message);
    }
  };

  // 编辑 DNS 记录
  const handleEditRecord = (record) => {
    setCurrentRecord(record);
    setFormData({
      type: record.type,
      name: record.name,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied
    });
    setShowModal(true);
  };

  // 创建新 DNS 记录
  const handleCreateRecord = () => {
    setCurrentRecord(null);
    setFormData({
      type: 'A',
      name: '',
      content: '',
      ttl: 1,
      proxied: false
    });
    setShowModal(true);
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentRecord) {
        // 更新现有记录
        await axios.put(
          `${API_BASE_URL}/zones/${selectedZone.id}/dns_records/${currentRecord.id}`,
          formData
        );
      } else {
        // 创建新记录
        await axios.post(
          `${API_BASE_URL}/zones/${selectedZone.id}/dns_records`,
          formData
        );
      }
      
      // 关闭模态框并刷新记录
      setShowModal(false);
      const response = await axios.get(`${API_BASE_URL}/zones/${selectedZone.id}/dns_records`);
      if (response.data.success) {
        setDnsRecords(response.data.result);
      }
    } catch (err) {
      setError('保存记录时出错: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cloudflare DNS 管理面板</h1>
          <p className="text-gray-600 mb-6">管理您的 Cloudflare DNS 解析记录</p>
          
          {/* 域名选择器 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zone-select">
              选择域名
            </label>
            <select
              id="zone-select"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleZoneChange}
              value={selectedZone?.id || ''}
              disabled={isLoading}
            >
              <option value="">-- 请选择域名 --</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 错误信息显示 */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 加载状态 */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* DNS 记录表格 */}
          {selectedZone && !isLoading && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  {selectedZone.name} 的 DNS 记录
                </h2>
                <button
                  onClick={handleCreateRecord}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  添加记录
                </button>
              </div>
              
              {dnsRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">暂无记录</h3>
                  <p className="mt-1 text-sm text-gray-500">开始添加您的第一条 DNS 记录</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTL</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代理状态</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dnsRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 break-all max-w-xs">{record.content}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.ttl === 1 ? '自动' : `${record.ttl} 秒`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.proxied ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                已代理
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                直连
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 创建/编辑记录模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentRecord ? '编辑 DNS 记录' : '创建 DNS 记录'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">记录类型</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="AAAA">AAAA</option>
                      <option value="CNAME">CNAME</option>
                      <option value="MX">MX</option>
                      <option value="TXT">TXT</option>
                      <option value="SRV">SRV</option>
                      <option value="NS">NS</option>
                      <option value="CAA">CAA</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                    <input
                      type="text"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TTL</label>
                    <select
                      name="ttl"
                      value={formData.ttl}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>自动</option>
                      <option value={120}>2 分钟</option>
                      <option value={300}>5 分钟</option>
                      <option value={600}>10 分钟</option>
                      <option value={900}>15 分钟</option>
                      <option value={1800}>30 分钟</option>
                      <option value={3600}>1 小时</option>
                      <option value={7200}>2 小时</option>
                      <option value={18000}>5 小时</option>
                      <option value={43200}>12 小时</option>
                      <option value={86400}>24 小时</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="proxied"
                      name="proxied"
                      checked={formData.proxied}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="proxied" className="ml-2 block text-sm text-gray-700">
                      启用 Cloudflare 代理 (橙色云朵)
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {currentRecord ? '更新记录' : '创建记录'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;