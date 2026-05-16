import React, { useState } from 'react';
import { Copy, Check, QrCode, Download, Trash2, Clock, UserCheck } from 'lucide-react';
import { getFrontendDownloadUrl } from '../services/api';
import QRPopup from './QRPopup';

const FileCard = ({ file, status }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const downloadUrl = getFrontendDownloadUrl(file.id);
  const currentStatus = status || (file.isDownloaded ? 'DOWNLOADED' : 'READY');
  
  const isDeleted = currentStatus === 'DELETED' || currentStatus === 'EXPIRED';

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(downloadUrl)
        .then(() => showCopiedStatus())
        .catch(() => fallbackCopyTextToClipboard(downloadUrl));
    } else {
      fallbackCopyTextToClipboard(downloadUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopiedStatus();
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const showCopiedStatus = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className={`bg-surface p-4 rounded-xl border transition-all duration-300 ${isDeleted ? 'border-red-500/20 opacity-75' : 'border-white/5 hover:border-white/10'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDeleted ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
              <Download size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium truncate" title={file.originalFilename}>
                {file.originalFilename}
              </h4>
              <div className="flex items-center text-xs text-textMuted mt-1 space-x-2">
                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {isDeleted ? currentStatus : (file.sharingMode === 'SINGLE' ? 'Auto-deletes after download' : 'Expires in 30m')}
                </span>
              </div>
              {file.downloadedBy && file.downloadedBy.length > 0 && (
                <div className="flex items-center text-xs text-green-400 mt-1.5 font-medium">
                  <UserCheck size={12} className="mr-1" />
                  Downloaded by: {file.downloadedBy[file.downloadedBy.length - 1]} 
                  {file.downloadedBy.length > 1 && ` (+${file.downloadedBy.length - 1} others)`}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            {!isDeleted && (
              <>
                <button 
                  onClick={() => setShowQR(true)}
                  className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Show QR Code"
                >
                  <QrCode size={18} />
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Copy Link"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </>
            )}
            {isDeleted && (
              <div className="p-2 text-red-400 bg-red-500/10 rounded-lg">
                <Trash2 size={18} />
              </div>
            )}
          </div>
        </div>

        {!isDeleted && (
          <div className="bg-background rounded-lg p-2 flex items-center">
            <input 
              type="text" 
              readOnly 
              value={downloadUrl} 
              className="bg-transparent border-none outline-none text-xs text-textMuted w-full px-2"
            />
          </div>
        )}
      </div>

      {showQR && (
        <QRPopup 
          url={downloadUrl} 
          filename={file.originalFilename}
          onClose={() => setShowQR(false)} 
        />
      )}
    </>
  );
};

export default FileCard;
