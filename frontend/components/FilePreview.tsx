import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  Copy, 
  Move,
  Tag,
  Info,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Eye,
  Calendar,
  HardDrive,
  FileText,
  Image,
  Video,
  Archive
} from 'lucide-react';
import { FileMetadata, FileTag } from './FileManager';

interface FilePreviewProps {
  file: FileMetadata;
  files: FileMetadata[];
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onDownload?: (file: FileMetadata) => void;
  onShare?: (file: FileMetadata) => void;
  onDelete?: (file: FileMetadata) => void;
  onEdit?: (file: FileMetadata) => void;
  onTag?: (file: FileMetadata, tags: FileTag[]) => void;
  showNavigation?: boolean;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  files,
  onClose,
  onNext,
  onPrevious,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  onTag,
  showNavigation = true,
  className = ''
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [currentTags, setCurrentTags] = useState<FileTag[]>(file.tags);
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentIndex = files.findIndex(f => f.id === file.id);
  const hasNext = currentIndex < files.length - 1;
  const hasPrevious = currentIndex > 0;

  useEffect(() => {
    setCurrentTags(file.tags);
    setZoom(1);
    setRotation(0);
    setIsPlaying(false);
    loadMetadata();
  }, [file]);

  const loadMetadata = async () => {
    setIsLoading(true);
    try {
      // Simulate metadata loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let mockMetadata: any = {};
      
      if (file.mimeType?.startsWith('image/')) {
        mockMetadata = {
          dimensions: '1920 x 1080',
          colorSpace: 'sRGB',
          fileSize: file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          camera: 'Sample Camera',
          taken: file.lastModified.toLocaleString(),
          location: 'San Francisco, CA',
          iso: '400',
          aperture: 'f/2.8',
          shutterSpeed: '1/125'
        };
      } else if (file.mimeType?.startsWith('video/')) {
        mockMetadata = {
          duration: '2:30',
          dimensions: '1920 x 1080',
          frameRate: '30 fps',
          codec: 'H.264',
          fileSize: file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          created: file.lastModified.toLocaleString()
        };
      } else if (file.mimeType === 'application/pdf') {
        mockMetadata = {
          pages: '24',
          fileSize: file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          created: file.lastModified.toLocaleString(),
          modified: file.lastModified.toLocaleString(),
          author: 'Sample Author',
          title: file.name.replace('.pdf', '')
        };
      }
      
      setMetadata(mockMetadata);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return <Image className="w-8 h-8 text-green-500" />;
    if (mimeType?.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <Archive className="w-8 h-8 text-yellow-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const renderPreviewContent = () => {
    if (file.mimeType?.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <img
              src={file.thumbnail || '/placeholder-image.jpg'}
              alt={file.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxWidth: zoom > 1 ? 'none' : '100%',
                maxHeight: zoom > 1 ? 'none' : '100%'
              }}
              onLoad={() => setIsLoading(false)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (file.mimeType?.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <video
              className="max-w-full max-h-full"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              muted={isMuted}
            >
              <source src={file.thumbnail} type={file.mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }

    if (file.mimeType === 'application/pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <FileText className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{file.name}</h3>
          <p className="text-gray-500 mb-4">PDF Document</p>
          <button
            onClick={() => onDownload?.(file)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      );
    }

    // Default for other file types
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        {getFileIcon(file.mimeType)}
        <h3 className="text-lg font-semibold mt-4 mb-2">{file.name}</h3>
        <p className="text-gray-500 mb-4">{file.mimeType || 'Unknown file type'}</p>
        <div className="text-sm text-gray-400">
          <p>Size: {formatFileSize(file.size)}</p>
          <p>Modified: {file.lastModified.toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => onDownload?.(file)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-4"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    );
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">File Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="text-gray-900">{value as string}</span>
            </div>
          ))}
        </div>
        
        {file.classification && (
          <>
            <h4 className="font-semibold text-gray-900 mt-4">AI Classification</h4>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">{file.classification.foodName}</span>
                <span className="text-sm text-green-600">
                  {(file.classification.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
              <span className="text-sm text-green-700">Category: {file.classification.category}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center ${className}`}>
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold">{file.name}</h2>
              <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Image controls */}
            {file.mimeType?.startsWith('image/') && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Reset"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-600 mx-2" />
              </>
            )}

            {/* Action buttons */}
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className={`p-2 rounded-lg transition-colors ${
                showMetadata ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              title="Show Metadata"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTags(!showTags)}
              className={`p-2 rounded-lg transition-colors ${
                showTags ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              title="Manage Tags"
            >
              <Tag className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload?.(file)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onShare?.(file)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit?.(file)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(file)}
              className="p-2 hover:bg-red-800 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            {renderPreviewContent()}
          </div>

          {/* Sidebar */}
          {(showMetadata || showTags) && (
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
              {showMetadata && (
                <div className="p-6">
                  {renderMetadata()}
                </div>
              )}
              
              {showTags && (
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentTags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 text-sm rounded-full text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onTag?.(file, currentTags)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Manage Tags
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        {showNavigation && (hasNext || hasPrevious) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 rounded-full p-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`p-2 rounded-full transition-colors ${
                hasPrevious ? 'hover:bg-white hover:bg-opacity-20 text-white' : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white text-sm px-2">
              {currentIndex + 1} / {files.length}
            </span>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-full transition-colors ${
                hasNext ? 'hover:bg-white hover:bg-opacity-20 text-white' : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Keyboard shortcuts */}
        <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
          Press ESC to close
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
