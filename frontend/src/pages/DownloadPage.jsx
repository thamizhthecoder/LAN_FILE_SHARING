import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, ArrowLeft, File as FileIcon, Clock, ShieldCheck, X } from 'lucide-react';
import { getFileDetails, getDownloadUrl } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';

const DownloadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fileStatuses } = useWebSocket();
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const data = await getFileDetails(id);
        setFile(data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'File not found or has expired.' : 'Failed to load file details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  const currentStatus = fileStatuses[id] || (file?.isDownloaded ? 'DOWNLOADED' : 'READY');
  const isDeleted = currentStatus === 'DELETED' || currentStatus === 'EXPIRED';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || isDeleted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-400" size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">File Unavailable</h2>
        <p className="text-textMuted mb-8">{error || 'This file has already been downloaded or has expired.'}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-surface hover:bg-white/5 border border-white/10 px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </button>
      </div>
    );
  }

  const handleAccept = () => {
    window.location.href = getDownloadUrl(id);
  };

  return (
    <div className="max-w-md mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-textMuted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <div className="bg-surface rounded-2xl border border-white/5 p-8 shadow-xl text-center">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileIcon size={40} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 truncate px-4" title={file.originalFilename}>
          {file.originalFilename}
        </h2>
        
        <div className="flex justify-center items-center space-x-4 text-sm text-textMuted mb-6">
          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          <span>•</span>
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {file.sharingMode === 'SINGLE' ? 'Auto-deletes after download' : 'Available for 30m'}
          </span>
        </div>

        {file.potentiallyDangerous ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-8 flex items-start text-left">
            <AlertCircle className="text-amber-400 shrink-0 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-amber-400 mb-0.5">Potentially Harmful File Type</p>
              <p className="text-xs text-amber-400/80">Only download this file if you completely trust the sender.</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-8 flex items-start text-left">
            <ShieldCheck className="text-green-400 shrink-0 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-green-400 mb-0.5">Verified Safe</p>
              <p className="text-xs text-green-400/80">Local network transfer. Files do not pass through the internet.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/')}
            className="bg-surface hover:bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center w-full"
          >
            <X size={20} className="mr-2 text-textMuted" />
            Deny
          </button>
          <button 
            onClick={handleAccept}
            className="bg-primary hover:bg-primaryHover text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary/25 flex items-center justify-center w-full"
          >
            <Download size={20} className="mr-2" />
            Accept
          </button>
        </div>

        <p className="text-xs text-textMuted mt-6">
          By accepting, the file will be securely downloaded to your device.
        </p>
      </div>
    </div>
  );
};

export default DownloadPage;
