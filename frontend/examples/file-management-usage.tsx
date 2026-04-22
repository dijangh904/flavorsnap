import React, { useState } from 'react';
import FileManager from '../components/FileManager';
import FilePreview from '../components/FilePreview';
import { useFileManagement } from '../hooks/useFileManagement';
import { FileMetadata } from '../components/FileManager';

const FileManagementExample: React.FC = () => {
  const {
    files,
    folders,
    tags,
    selectedFiles,
    uploadFiles,
    deleteFiles,
    createFolder,
    shareFiles,
    getStorageUsage
  } = useFileManagement();

  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
  const [showFileManager, setShowFileManager] = useState(true);

  const handleFileSelect = (file: FileMetadata) => {
    setPreviewFile(file);
    setShowFileManager(false);
  };

  const handlePreviewClose = () => {
    setPreviewFile(null);
    setShowFileManager(true);
  };

  const handleDownload = (file: FileMetadata) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.thumbnail || '#';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (file: FileMetadata) => {
    await shareFiles([file.id], {
      isPublic: true,
      sharedWith: [],
      permissions: {
        canView: true,
        canDownload: true,
        canEdit: false,
        canShare: false
      }
    });
    alert('File shared successfully!');
  };

  const handleDelete = async (file: FileMetadata) => {
    if (confirm('Are you sure you want to delete this file?')) {
      await deleteFiles([file.id]);
      handlePreviewClose();
    }
  };

  const storage = getStorageUsage();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Management System</h1>
          <p className="text-gray-600">
            Comprehensive file management with folders, tags, and batch operations
          </p>
        </div>

        {/* Storage Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Storage Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Storage</p>
              <p className="text-2xl font-bold text-gray-900">
                {(storage.used / 1024 / 1024).toFixed(1)} MB
              </p>
              <p className="text-sm text-gray-500">
                {(storage.available / 1024 / 1024).toFixed(1)} MB available
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Files</p>
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              <p className="text-sm text-gray-500">{folders.length} folders</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tags</p>
              <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
              <p className="text-sm text-gray-500">categories</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-colors ${
                  storage.percentage > 90 ? 'bg-red-500' : 
                  storage.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${storage.percentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {storage.percentage.toFixed(1)}% storage used
            </p>
          </div>
        </div>

        {/* Features Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium">Folder Creation</h3>
                <p className="text-sm text-gray-500">Organize files in folders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium">File Tagging</h3>
                <p className="text-sm text-gray-500">Add metadata and tags</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-medium">Batch Upload</h3>
                <p className="text-sm text-gray-500">Upload multiple files</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-medium">Search & Filter</h3>
                <p className="text-sm text-gray-500">Find files easily</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">5</span>
              </div>
              <div>
                <h3 className="font-medium">Drag & Drop</h3>
                <p className="text-sm text-gray-500">Organize files visually</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">6</span>
              </div>
              <div>
                <h3 className="font-medium">File Sharing</h3>
                <p className="text-sm text-gray-500">Share with collaboration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">7</span>
              </div>
              <div>
                <h3 className="font-medium">Storage Monitoring</h3>
                <p className="text-sm text-gray-500">Track usage in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">8</span>
              </div>
              <div>
                <h3 className="font-medium">AI Classification</h3>
                <p className="text-sm text-gray-500">Auto-classify food images</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">9</span>
              </div>
              <div>
                <h3 className="font-medium">File Preview</h3>
                <p className="text-sm text-gray-500">Preview files in detail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.onchange = (e) => {
                  if (e.target.files) {
                    uploadFiles(e.target.files);
                  }
                };
                input.click();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Upload Files
            </button>
            <button
              onClick={() => createFolder('New Folder')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Create Folder
            </button>
            <button
              onClick={() => setShowFileManager(!showFileManager)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              {showFileManager ? 'Hide' : 'Show'} File Manager
            </button>
            {selectedFiles.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedFiles.length} selected files?`)) {
                    deleteFiles(selectedFiles);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Selected ({selectedFiles.length})
              </button>
            )}
          </div>
        </div>

        {/* File Manager / Preview */}
        {showFileManager ? (
          <FileManager
            onFileSelect={handleFileSelect}
            maxStorage={1024 * 1024 * 1024} // 1GB
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500">
              Select a file to preview or toggle the file manager above
            </p>
          </div>
        )}

        {/* File Preview Modal */}
        {previewFile && (
          <FilePreview
            file={previewFile}
            files={files}
            onClose={handlePreviewClose}
            onNext={() => {
              const currentIndex = files.findIndex(f => f.id === previewFile.id);
              if (currentIndex < files.length - 1) {
                setPreviewFile(files[currentIndex + 1]);
              }
            }}
            onPrevious={() => {
              const currentIndex = files.findIndex(f => f.id === previewFile.id);
              if (currentIndex > 0) {
                setPreviewFile(files[currentIndex - 1]);
              }
            }}
            onDownload={handleDownload}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default FileManagementExample;
