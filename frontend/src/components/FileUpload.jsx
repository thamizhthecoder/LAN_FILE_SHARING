import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { uploadFile } from '../services/api';

const FileUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [sharingMode, setSharingMode] = useState('SINGLE');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    maxSize: 5000 * 1024 * 1024 // 5GB
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const data = await uploadFile(file, sharingMode, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      onUploadComplete(data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-xl">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
        >
          <input {...getInputProps()} />
          <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-textMuted'}`} />
          <h3 className="text-lg font-medium mb-2">Drag & drop a file here</h3>
          <p className="text-sm text-textMuted mb-6">or click to select from your computer</p>
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            Browse Files
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="h-12 w-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center mr-4">
              <FileIcon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-textMuted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button 
                onClick={() => setFile(null)}
                className="p-2 text-textMuted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!uploading && (
            <div className={`border rounded-xl p-4 transition-colors duration-300 ${sharingMode === 'SINGLE' ? 'bg-amber-950/20 border-amber-500/20' : 'bg-indigo-950/20 border-indigo-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="pr-4">
                  <h4 className={`text-sm font-medium transition-colors duration-300 ${sharingMode === 'SINGLE' ? 'text-amber-400' : 'text-indigo-400'}`}>
                    {sharingMode === 'SINGLE' ? 'One-Time Share' : 'Group Share'}
                  </h4>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${sharingMode === 'SINGLE' ? 'text-amber-400/70' : 'text-indigo-400/70'}`}>
                    {sharingMode === 'SINGLE' 
                      ? 'File auto-deletes immediately after the first download.' 
                      : 'Keeps file available for 30 minutes for multiple downloads.'}
                  </p>
                </div>
                <button
                  onClick={() => setSharingMode(prev => prev === 'SINGLE' ? 'MULTI' : 'SINGLE')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${sharingMode === 'SINGLE' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}
                  role="switch"
                  aria-checked={sharingMode === 'MULTI'}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-300 ease-in-out ${sharingMode === 'MULTI' ? 'translate-x-5 bg-indigo-500' : 'translate-x-0 bg-amber-500'}`}
                  />
                </button>
              </div>
            </div>
          )}

          {uploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button 
                onClick={handleUpload}
                className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25"
              >
                Generate Link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
