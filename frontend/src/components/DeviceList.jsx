import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, RefreshCw } from 'lucide-react';
import { getDevices } from '../services/api';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-xl h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Nearby Devices</h3>
        <button 
          onClick={fetchDevices}
          className={`p-2 text-textMuted hover:text-white transition-colors rounded-lg hover:bg-white/5 ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Monitor className="text-primary opacity-50" size={32} />
          </div>
          <p className="text-sm text-textMuted">No other devices found on this network.</p>
          <p className="text-xs text-textMuted mt-2">Make sure others have the app open.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device, index) => (
            <div key={index} className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 text-primary">
                {device.name.toLowerCase().includes('phone') || device.name.toLowerCase().includes('mobile') ? (
                  <Smartphone size={20} />
                ) : (
                  <Monitor size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{device.name}</p>
                <p className="text-xs text-textMuted">{device.ipAddress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceList;
