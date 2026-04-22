import React, { useState, useCallback, useRef } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  Share2, 
  Tag, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Image,
  FileText,
  Video,
  Archive,
  HardDrive,
  Users,
  X,
  Check,
  Edit2,
  Copy,
  Move
} from 'lucide-react';

export interface FileTag {
  id: string;
  name: string;
  color: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  lastModified: Date;
  tags: FileTag[];
  folderId?: string;
  path: string;
  thumbnail?: string;
  classification?: {
    foodName: string;
    confidence: number;
    category: string;
  };
  shared?: boolean;
  sharedWith?: string[];
  owner?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  createdAt: Date;
  children: Folder[];
  files: FileMetadata[];
}

interface FileManagerProps {
  className?: string;
  onFileSelect?: (file: FileMetadata) => void;
  onFolderSelect?: (folder: Folder) => void;
  maxStorage?: number;
}

const FileManager: React.FC<FileManagerProps> = ({ 
  className = '', 
  onFileSelect, 
  onFolderSelect,
  maxStorage = 1024 * 1024 * 1024 // 1GB default
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - in real app this would come from API
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'root',
      name: 'Root',
      path: '/',
      createdAt: new Date(),
      children: [
        {
          id: 'images',
          name: 'Images',
          parentId: 'root',
          path: '/Images',
          createdAt: new Date(),
          children: [],
          files: []
        },
        {
          id: 'documents',
          name: 'Documents',
          parentId: 'root',
          path: '/Documents',
          createdAt: new Date(),
          children: [],
          files: []
        }
      ],
      files: []
    }
  ]);

  const [files, setFiles] = useState<FileMetadata[]>([
    {
      id: '1',
      name: 'apple.jpg',
      type: 'file',
      size: 1024 * 500,
      mimeType: 'image/jpeg',
      lastModified: new Date(),
      tags: [
        { id: 'fruit', name: 'Fruit', color: 'red' },
        { id: 'fresh', name: 'Fresh', color: 'green' }
      ],
      folderId: 'images',
      path: '/Images/apple.jpg',
      thumbnail: '/thumbnails/apple.jpg',
      classification: {
        foodName: 'Apple',
        confidence: 0.95,
        category: 'Fruit'
      }
    },
    {
      id: '2',
      name: 'pizza.jpg',
      type: 'file',
      size: 1024 * 800,
      mimeType: 'image/jpeg',
      lastModified: new Date(),
      tags: [
        { id: 'fast-food', name: 'Fast Food', color: 'orange' }
      ],
      folderId: 'images',
      path: '/Images/pizza.jpg',
      thumbnail: '/thumbnails/pizza.jpg',
      classification: {
        foodName: 'Pizza',
        confidence: 0.87,
        category: 'Fast Food'
      }
    }
  ]);

  const [tags] = useState<FileTag[]>([
    { id: 'fruit', name: 'Fruit', color: 'red' },
    { id: 'fresh', name: 'Fresh', color: 'green' },
    { id: 'fast-food', name: 'Fast Food', color: 'orange' },
    { id: 'vegetable', name: 'Vegetable', color: 'green' },
    { id: 'dessert', name: 'Dessert', color: 'pink' }
  ]);

  const getFileIcon = (file: FileMetadata) => {
    if (file.type === 'folder') return <Folder className="w-8 h-8 text-blue-500" />;
    
    if (file.mimeType?.startsWith('image/')) return <Image className="w-8 h-8 text-green-500" />;
    if (file.mimeType?.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (file.mimeType?.includes('zip') || file.mimeType?.includes('rar')) return <Archive className="w-8 h-8 text-yellow-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFileUpload = useCallback((uploadedFiles: FileList) => {
    Array.from(uploadedFiles).forEach((file, index) => {
      const fileId = `upload-${Date.now()}-${index}`;
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          const newFile: FileMetadata = {
            id: fileId,
            name: file.name,
            type: 'file',
            size: file.size,
            mimeType: file.type,
            lastModified: new Date(file.lastModified),
            tags: [],
            folderId: currentFolder === 'root' ? undefined : currentFolder,
            path: currentFolder === 'root' ? `/${file.name}` : `${folders.find(f => f.id === currentFolder)?.path}/${file.name}`,
            thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
          };
          
          setFiles(prev => [...prev, newFile]);
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
        } else {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }
      }, 200);
    });
  }, [currentFolder, folders]);

  const handleDragStart = (e: React.DragEvent, fileIds: string[]) => {
    setDraggedFiles(fileIds);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault();
    if (draggedFiles.length > 0) {
      setFiles(prev => prev.map(file => 
        draggedFiles.includes(file.id) 
          ? { ...file, folderId: targetFolderId }
          : file
      ));
      setDraggedFiles([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    const currentFiles = files.filter(file => 
      currentFolder === 'root' ? !file.folderId : file.folderId === currentFolder
    );
    setSelectedFiles(currentFiles.map(f => f.id));
  };

  const deleteSelectedFiles = () => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId: currentFolder === 'root' ? undefined : currentFolder,
      path: currentFolder === 'root' ? `/${name}` : `${folders.find(f => f.id === currentFolder)?.path}/${name}`,
      createdAt: new Date(),
      children: [],
      files: []
    };
    
    setFolders(prev => [...prev, newFolder]);
    setShowCreateFolder(false);
  };

  const getCurrentFolderFiles = () => {
    return files.filter(file => 
      currentFolder === 'root' ? !file.folderId : file.folderId === currentFolder
    );
  };

  const getStorageUsage = () => {
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    return {
      used: totalSize,
      available: maxStorage - totalSize,
      percentage: (totalSize / maxStorage) * 100
    };
  };

  const filteredFiles = getCurrentFolderFiles().filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const storage = getStorageUsage();

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {formatFileSize(storage.used)} of {formatFileSize(maxStorage)} used
            </span>
          </div>
          <span className={`font-medium ${storage.percentage > 90 ? 'text-red-500' : 'text-gray-700'}`}>
            {storage.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-colors ${
              storage.percentage > 90 ? 'bg-red-500' : 
              storage.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${storage.percentage}%` }}
          />
        </div>
      </div>

      {/* File List/Grid */}
      <div className="p-4">
        {selectedFiles.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedFiles.length} files selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareDialog(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
              <button
                onClick={() => setShowTagDialog(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <Tag className="w-3 h-3" />
                Tag
              </button>
              <button
                onClick={deleteSelectedFiles}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleDragStart(e, [file.id])}
                onClick={() => toggleFileSelection(file.id)}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedFiles.includes(file.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>

                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {file.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {file.tags.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">
                        +{file.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {file.classification && (
                  <div className="mt-2 text-xs text-center">
                    <span className="text-green-600 font-medium">
                      {file.classification.foodName}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({(file.classification.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                )}

                {uploadProgress[file.id] !== undefined && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadProgress[file.id].toFixed(0)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleDragStart(e, [file.id])}
                onClick={() => toggleFileSelection(file.id)}
                className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedFiles.includes(file.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{file.lastModified.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                {file.classification && (
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {file.classification.foodName}
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show file options
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  createFolder(e.currentTarget.value);
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Folder name"]') as HTMLInputElement;
                  if (input.value) createFolder(input.value);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
