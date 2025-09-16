import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const RecordEditModal = ({ isOpen, onClose, record, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: 'A',
    name: '',
    content: '',
    ttl: 3600,
    proxied: false, // Add proxied state
  });

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          type: record.type || 'A',
          name: record.name || '',
          content: record.content || '',
          ttl: record.ttl || 3600,
          proxied: record.proxied !== undefined ? record.proxied : false, // Initialize proxied
        });
      } else {
        setFormData({ type: 'A', name: '', content: '', ttl: 3600, proxied: false });
      }
    }
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error(t('dashboard.modal.errors.nameContentRequired'));
      return;
    }
    onSave(formData);
  };

  const isProxiedApplicable = ['A', 'AAAA', 'CNAME'].includes(formData.type);

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md m-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{record ? t('dashboard.modal.editTitle') : t('dashboard.modal.createTitle')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600">{t('dashboard.modal.nameLabel')}</label>
            <input type="text" name="name" id="name" placeholder="e.g., @, www, mail" value={formData.name} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-600">{t('dashboard.modal.typeLabel')}</label>
            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option>A</option>
              <option>AAAA</option>
              <option>CNAME</option>
              <option>TXT</option>
              <option>MX</option>
              <option>NS</option>
              <option>PTR</option>
              <option>SPF</option>
              <option>SRV</option>
              <option>CAA</option>
              <option>DANE</option>
              <option>SVCB</option>
              <option>HTTPS</option>
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-600">{t('dashboard.modal.contentLabel')}</label>
            <input type="text" name="content" id="content" placeholder="e.g., 192.168.1.1 or yourdomain.com" value={formData.content} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label htmlFor="ttl" className="block text-sm font-medium text-slate-600">{t('dashboard.modal.ttlLabel')}</label>
            <input type="number" name="ttl" id="ttl" value={formData.ttl} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          {isProxiedApplicable && (
            <div className="flex items-center">
              <input
                id="proxied"
                name="proxied"
                type="checkbox"
                checked={formData.proxied}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="proxied" className="ml-2 block text-sm text-slate-600">
                {t('dashboard.modal.proxiedByCloudflare')}
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors">
              {t('dashboard.modal.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              {t('dashboard.modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordEditModal;
