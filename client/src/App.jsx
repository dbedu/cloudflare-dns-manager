import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// DNS记录表单组件，用于添加和修改DNS记录
const RecordForm = ({ record, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: record?.type || 'A',
    name: record?.name || '',
    content: record?.content || '',
    ttl: record?.ttl || 1,
    proxied: record?.proxied || false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {record ? '修改DNS记录' : '添加DNS记录'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">记录类型</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
              <option value="TXT">TXT</option>
              <option value="MX">MX</option>
              <option value="NS">NS</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">名称</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="例如: www"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">内容</label>
            <input
              type="text"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="例如: 192.168.1.1"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">TTL</label>
            <select
              name="ttl"
              value={formData.ttl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="1">自动</option>
              <option value="60">1分钟</option>
              <option value="300">5分钟</option>
              <option value="1800">30分钟</option>
              <option value="3600">1小时</option>
              <option value="86400">1天</option>
            </select>
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="proxied"
              checked={formData.proxied}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700">启用Cloudflare代理</label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function App() {
  // 状态管理
  const [zones, setZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [dnsRecords, setDnsRecords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  // API基础URL
  const API_BASE_URL = 'http://localhost:3001/api'

  // 获取所有域名
  useEffect(() => {
    const fetchZones = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get(`${API_BASE_URL}/zones`)
        if (response.data.success) {
          setZones(response.data.result)
        } else {
          setError('获取域名列表失败')
        }
      } catch (err) {
        setError(`获取域名列表错误: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchZones()
  }, [])

  // 当选择的域名变化时，获取DNS记录
  useEffect(() => {
    if (!selectedZone) return

    const fetchDnsRecords = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get(`${API_BASE_URL}/zones/${selectedZone.id}/dns_records`)
        if (response.data.success) {
          setDnsRecords(response.data.result)
        } else {
          setError('获取DNS记录失败')
        }
      } catch (err) {
        setError(`获取DNS记录错误: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDnsRecords()
  }, [selectedZone])

  // 处理域名选择变化
  const handleZoneChange = (e) => {
    const zoneId = e.target.value
    const zone = zones.find(z => z.id === zoneId)
    setSelectedZone(zone || null)
  }

  // 打开添加记录表单
  const handleAddRecord = () => {
    setCurrentRecord(null)
    setShowForm(true)
  }

  // 打开修改记录表单
  const handleEditRecord = (record) => {
    setCurrentRecord(record)
    setShowForm(true)
  }

  // 处理删除记录
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('确定要删除这条记录吗？')) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.delete(`${API_BASE_URL}/zones/${selectedZone.id}/dns_records/${recordId}`)
      if (response.data.success) {
        // 删除成功后刷新记录列表
        setDnsRecords(prev => prev.filter(record => record.id !== recordId))
      } else {
        setError('删除记录失败')
      }
    } catch (err) {
      setError(`删除记录错误: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理表单提交（添加或修改记录）
  const handleFormSubmit = async (formData) => {
    setIsLoading(true)
    setError(null)
    try {
      let response
      
      if (currentRecord) {
        // 修改现有记录
        response = await axios.put(
          `${API_BASE_URL}/zones/${selectedZone.id}/dns_records/${currentRecord.id}`,
          formData
        )
      } else {
        // 添加新记录
        response = await axios.post(
          `${API_BASE_URL}/zones/${selectedZone.id}/dns_records`,
          formData
        )
      }

      if (response.data.success) {
        // 操作成功后刷新记录列表
        if (currentRecord) {
          setDnsRecords(prev => prev.map(record => 
            record.id === currentRecord.id ? response.data.result : record
          ))
        } else {
          setDnsRecords(prev => [...prev, response.data.result])
        }
        setShowForm(false)
      } else {
        setError(currentRecord ? '修改记录失败' : '添加记录失败')
      }
    } catch (err) {
      setError(`${currentRecord ? '修改' : '添加'}记录错误: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cloudflare DNS 管理面板</h1>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* 域名选择器 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">选择域名:</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedZone?.id || ''}
            onChange={handleZoneChange}
            disabled={isLoading || zones.length === 0}
          >
            <option value="">-- 请选择域名 --</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
        
        {/* DNS记录表格 */}
        {selectedZone && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">DNS 解析记录</h2>
              <button
                onClick={handleAddRecord}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={isLoading}
              >
                添加记录
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">加载中...</div>
            ) : dnsRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">类型</th>
                      <th className="py-2 px-4 border-b text-left">名称</th>
                      <th className="py-2 px-4 border-b text-left">内容</th>
                      <th className="py-2 px-4 border-b text-left">TTL</th>
                      <th className="py-2 px-4 border-b text-center">代理状态</th>
                      <th className="py-2 px-4 border-b text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsRecords.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{record.type}</td>
                        <td className="py-2 px-4 border-b">{record.name}</td>
                        <td className="py-2 px-4 border-b">{record.content}</td>
                        <td className="py-2 px-4 border-b">
                          {record.ttl === 1 ? '自动' : `${record.ttl}秒`}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <span className={`inline-block rounded-full px-2 py-1 text-xs ${record.proxied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {record.proxied ? '已代理' : '未代理'}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                          >
                            修改
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                没有找到DNS记录，请点击"添加记录"按钮创建新记录。
              </div>
            )}
          </div>
        )}
        
        {/* 记录表单模态框 */}
        {showForm && (
          <RecordForm
            record={currentRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  )
}

export default App
