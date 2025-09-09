import React, { useState } from 'react';
import axios from 'axios';

const DNSRecordTable = ({ records, fetchDnsRecords }) => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({ type: 'A', name: '', content: '', proxied: false });

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({ type: record.type, name: record.name, content: record.content, proxied: record.proxied });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/dns-records/${id}`);
      fetchDnsRecords();
    } catch (error) {
      console.error('Error deleting DNS record:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await axios.put(`http://localhost:3001/api/dns-records/${editingRecord.id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/dns-records', formData);
      }
      setEditingRecord(null);
      setFormData({ type: 'A', name: '', content: '', proxied: false });
      fetchDnsRecords();
    } catch (error) {
      console.error('Error saving DNS record:', error);
    }
  };

  return (
    <div>
        {/* Form for adding/editing records */}
        <form onSubmit={handleFormSubmit}>
            {/* ... form fields for type, name, content, proxied ... */}
            <button type="submit">{editingRecord ? 'Update' : 'Create'}</button>
        </form>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Content</th>
            <th>Proxied</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{record.type}</td>
              <td>{record.name}</td>
              <td>{record.content}</td>
              <td>{record.proxied ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(record)}>Edit</button>
                <button onClick={() => handleDelete(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DNSRecordTable;