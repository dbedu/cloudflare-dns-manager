import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DNSRecordTable from './components/DNSRecordTable';
import './App.css';

function App() {
  const [dnsRecords, setDnsRecords] = useState([]);

  useEffect(() => {
    fetchDnsRecords();
  }, []);

  const fetchDnsRecords = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/dns-records');
      setDnsRecords(response.data);
    } catch (error) {
      console.error('Error fetching DNS records:', error);
    }
  };

  return (
    <div className="App">
      <h1>Cloudflare DNS Management</h1>
      <DNSRecordTable records={dnsRecords} fetchDnsRecords={fetchDnsRecords} />
    </div>
  );
}

export default App;