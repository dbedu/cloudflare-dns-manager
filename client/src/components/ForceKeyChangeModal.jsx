import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = 'http://localhost:3001';

const ForceKeyChangeModal = ({ isOpen, onSave }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newKey !== confirmKey) {
      toast.error(t('adminPanel.errors.keysMismatch'));
      return;
    }
    setSaving(true);
    const toastId = toast.loading(t('adminPanel.messages.updatingLoginKey'));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/config/login-key`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentKey, newKey }),
      });
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success(t('adminPanel.messages.loginKeyUpdated'));
        onSave(); // Callback to parent to indicate success
      } else {
        const data = await response.json();
        toast.error(data.error || t('adminPanel.errors.updateLoginKey'));
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(t('adminPanel.errors.network'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md m-4 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 text-center">{t('forceKeyChange.title')}</h2>
        <p className="text-slate-600 text-center">{t('forceKeyChange.description')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentKey" className="block text-sm font-medium text-slate-600">{t('adminPanel.loginKey.currentKey')}</label>
            <input type="password" id="currentKey" value={currentKey} onChange={(e) => setCurrentKey(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('adminPanel.loginKey.currentKeyPlaceholder')} required />
          </div>
          <div>
            <label htmlFor="newKey" className="block text-sm font-medium text-slate-600">{t('adminPanel.loginKey.newKey')}</label>
            <input type="password" id="newKey" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('adminPanel.loginKey.newKeyPlaceholder')} required />
          </div>
          <div>
            <label htmlFor="confirmKey" className="block text-sm font-medium text-slate-600">{t('adminPanel.loginKey.confirmNewKey')}</label>
            <input type="password" id="confirmKey" value={confirmKey} onChange={(e) => setConfirmKey(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('adminPanel.loginKey.confirmNewKeyPlaceholder')} required />
          </div>
          <button type="submit" disabled={saving || !currentKey || !newKey || !confirmKey} className="w-full inline-flex justify-center items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? t('adminPanel.buttons.updating') : t('adminPanel.buttons.updateLoginKey')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceKeyChangeModal;
