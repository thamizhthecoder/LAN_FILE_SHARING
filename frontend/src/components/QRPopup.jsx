import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

const QRPopup = ({ url, filename, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6 mt-2">
          <h3 className="text-xl font-bold mb-1">Scan to Download</h3>
          <p className="text-sm text-textMuted truncate px-4">{filename}</p>
        </div>

        <div className="bg-white p-4 rounded-xl flex justify-center mb-6">
          <QRCodeSVG 
            value={url} 
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"M"}
            includeMargin={false}
          />
        </div>

        <p className="text-center text-xs text-textMuted">
          Make sure your phone is connected to the same Wi-Fi network.
        </p>
      </div>
    </div>
  );
};

export default QRPopup;
