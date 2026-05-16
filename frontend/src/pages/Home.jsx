import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import DeviceList from '../components/DeviceList';
import FileCard from '../components/FileCard';
import { useWebSocket } from '../context/WebSocketContext';

const Home = () => {
  const { fileUpdates, fileStatuses, connected } = useWebSocket();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (fileData) => {
    setUploadedFiles(prev => [fileData, ...prev]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Share File</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-textMuted">{connected ? 'Connected to Network' : 'Disconnected'}</span>
            </div>
          </div>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </section>

        {uploadedFiles.length > 0 && (
          <section>
            <h3 className="text-xl font-medium mb-4">Recent Uploads</h3>
            <div className="space-y-4">
              {uploadedFiles.map(file => (
                <FileCard 
                  key={file.id} 
                  file={fileUpdates[file.id] || file} 
                  status={fileStatuses[file.id]} 
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="lg:col-span-1">
        <DeviceList />
      </div>
    </div>
  );
};

export default Home;
