import { useState, useEffect, useCallback, useRef } from 'react';
import { FileMetadata, FileTag, Folder } from '../components/FileManager';

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileSearchFilters {
  query: string;
  tags: string[];
  fileTypes: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  folderId?: string;
}

export interface ShareSettings {
  isPublic: boolean;
  sharedWith: string[];
  permissions: {
    canView: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canShare: boolean;
  };
  expiresAt?: Date;
}

export interface UseFileManagementReturn {
  files: FileMetadata[];
  folders: Folder[];
  tags: FileTag[];
  selectedFiles: string[];
  currentFolder: string;
  uploadProgress: FileUploadProgress[];
  searchFilters: FileSearchFilters;
  
  // File operations
  uploadFiles: (files: FileList, folderId?: string) => Promise<string[]>;
  deleteFiles: (fileIds: string[]) => Promise<void>;
  moveFiles: (fileIds: string[], targetFolderId: string) => Promise<void>;
  copyFiles: (fileIds: string[], targetFolderId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  
  // Folder operations
  createFolder: (name: string, parentId?: string) => Promise<string>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  
  // Tag operations
  addTag: (name: string, color: string) => Promise<FileTag>;
  removeTag: (tagId: string) => Promise<void>;
  addTagToFile: (fileId: string, tagId: string) => Promise<void>;
  removeTagFromFile: (fileId: string, tagId: string) => Promise<void>;
  
  // Search and filter
  searchFiles: (filters: Partial<FileSearchFilters>) => FileMetadata[];
  filterFiles: (filters: Partial<FileSearchFilters>) => FileMetadata[];
  
  // Selection
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  
  // Navigation
  navigateToFolder: (folderId: string) => void;
  navigateBack: () => void;
  
  // Sharing
  shareFiles: (fileIds: string[], settings: ShareSettings) => Promise<void>;
  unshareFiles: (fileIds: string[]) => Promise<void>;
  
  // Storage
  getStorageUsage: () => { used: number; available: number; percentage: number };
  getFolderSize: (folderId: string) => number;
  
  // Batch operations
  batchClassify: (fileIds: string[]) => Promise<void>;
  batchDownload: (fileIds: string[]) => Promise<void>;
  batchTag: (fileIds: string[], tagIds: string[]) => Promise<void>;
}

const STORAGE_KEY = 'file-management-data';
const MAX_STORAGE = 1024 * 1024 * 1024; // 1GB

export const useFileManagement = (): UseFileManagementReturn => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<FileTag[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [searchFilters, setSearchFilters] = useState<FileSearchFilters>({
    query: '',
    tags: [],
    fileTypes: []
  });

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFiles(parsed.files?.map((f: any) => ({
          ...f,
          lastModified: new Date(f.lastModified)
        })) || []);
        setFolders(parsed.folders?.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        })) || []);
        setTags(parsed.tags || []);
      }
    } catch (error) {
      console.error('Failed to load file management data:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToSave = {
        files: files.map(f => ({
          ...f,
          lastModified: f.lastModified.toISOString()
        })),
        folders: folders.map(f => ({
          ...f,
          createdAt: f.createdAt.toISOString()
        })),
        tags
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save file management data:', error);
    }
  }, [files, folders, tags]);

  // File operations
  const uploadFiles = useCallback(async (fileList: FileList, folderId?: string): Promise<string[]> => {
    const uploadedFileIds: string[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileId = `file-${Date.now()}-${i}`;
      const abortController = new AbortController();
      abortControllersRef.current.set(fileId, abortController);

      const progressItem: FileUploadProgress = {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'pending'
      };
      
      setUploadProgress(prev => [...prev, progressItem]);

      try {
        // Simulate file upload with progress
        progressItem.status = 'uploading';
        setUploadProgress(prev => 
          prev.map(p => p.fileId === fileId ? progressItem : p)
        );

        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          if (abortController.signal.aborted) throw new Error('Upload cancelled');
          
          await new Promise(resolve => setTimeout(resolve, 100));
          progressItem.progress = progress;
          setUploadProgress(prev => 
            prev.map(p => p.fileId === fileId ? { ...progressItem, progress } : p)
          );
        }

        // Create file metadata
        const fileMetadata: FileMetadata = {
          id: fileId,
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          lastModified: new Date(file.lastModified),
          tags: [],
          folderId: folderId || currentFolder,
          path: folderId ? `/${folders.find(f => f.id === folderId)?.path}/${file.name}` : `/${file.name}`,
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };

        setFiles(prev => [...prev, fileMetadata]);
        uploadedFileIds.push(fileId);

        progressItem.status = 'completed';
        setUploadProgress(prev => 
          prev.map(p => p.fileId === fileId ? progressItem : p)
        );

        // Auto-classify if it's an image
        if (file.type.startsWith('image/')) {
          setTimeout(() => {
            classifyFile(fileId);
          }, 1000);
        }

      } catch (error) {
        progressItem.status = 'error';
        progressItem.error = error instanceof Error ? error.message : 'Upload failed';
        setUploadProgress(prev => 
          prev.map(p => p.fileId === fileId ? progressItem : p)
        );
      } finally {
        abortControllersRef.current.delete(fileId);
        
        // Remove progress item after completion
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(p => p.fileId !== fileId));
        }, 3000);
      }
    }

    return uploadedFileIds;
  }, [currentFolder, folders]);

  const deleteFiles = useCallback(async (fileIds: string[]): Promise<void> => {
    setFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
    setSelectedFiles(prev => prev.filter(id => !fileIds.includes(id)));
  }, []);

  const moveFiles = useCallback(async (fileIds: string[], targetFolderId: string): Promise<void> => {
    setFiles(prev => prev.map(file => 
      fileIds.includes(file.id) 
        ? { ...file, folderId: targetFolderId }
        : file
    ));
  }, []);

  const copyFiles = useCallback(async (fileIds: string[], targetFolderId: string): Promise<void> => {
    const filesToCopy = files.filter(file => fileIds.includes(file.id));
    const copiedFiles = filesToCopy.map(file => ({
      ...file,
      id: `copy-${file.id}-${Date.now()}`,
      name: `Copy of ${file.name}`,
      folderId: targetFolderId
    }));
    
    setFiles(prev => [...prev, ...copiedFiles]);
  }, [files]);

  const renameFile = useCallback(async (fileId: string, newName: string): Promise<void> => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, name: newName } : file
    ));
  }, []);

  // Folder operations
  const createFolder = useCallback(async (name: string, parentId?: string): Promise<string> => {
    const folderId = `folder-${Date.now()}`;
    const parentFolder = parentId ? folders.find(f => f.id === parentId) : null;
    
    const newFolder: Folder = {
      id: folderId,
      name,
      parentId,
      path: parentFolder ? `${parentFolder.path}/${name}` : `/${name}`,
      createdAt: new Date(),
      children: [],
      files: []
    };

    setFolders(prev => [...prev, newFolder]);
    return folderId;
  }, [folders]);

  const deleteFolder = useCallback(async (folderId: string): Promise<void> => {
    // Remove folder
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    
    // Move files in this folder to root
    setFiles(prev => prev.map(file => 
      file.folderId === folderId ? { ...file, folderId: undefined } : file
    ));
  }, []);

  const renameFolder = useCallback(async (folderId: string, newName: string): Promise<void> => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, name: newName } : folder
    ));
  }, []);

  // Tag operations
  const addTag = useCallback(async (name: string, color: string): Promise<FileTag> => {
    const newTag: FileTag = {
      id: `tag-${Date.now()}`,
      name,
      color
    };
    
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const removeTag = useCallback(async (tagId: string): Promise<void> => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    
    // Remove tag from all files
    setFiles(prev => prev.map(file => ({
      ...file,
      tags: file.tags.filter(tag => tag.id !== tagId)
    })));
  }, []);

  const addTagToFile = useCallback(async (fileId: string, tagId: string): Promise<void> => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, tags: [...file.tags, tag] }
        : file
    ));
  }, [tags]);

  const removeTagFromFile = useCallback(async (fileId: string, tagId: string): Promise<void> => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, tags: file.tags.filter(tag => tag.id !== tagId) }
        : file
    ));
  }, []);

  // Search and filter
  const searchFiles = useCallback((filters: Partial<FileSearchFilters>): FileMetadata[] => {
    let filtered = [...files];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(file => 
        filters.tags!.some(tagId => file.tags.some(tag => tag.id === tagId))
      );
    }

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      filtered = filtered.filter(file => 
        filters.fileTypes!.some(type => file.mimeType?.startsWith(type))
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(file => 
        file.lastModified >= filters.dateRange!.start &&
        file.lastModified <= filters.dateRange!.end
      );
    }

    if (filters.sizeRange) {
      filtered = filtered.filter(file => 
        file.size &&
        file.size >= filters.sizeRange!.min &&
        file.size <= filters.sizeRange!.max
      );
    }

    if (filters.folderId) {
      filtered = filtered.filter(file => file.folderId === filters.folderId);
    }

    return filtered;
  }, [files]);

  const filterFiles = useCallback((filters: Partial<FileSearchFilters>): FileMetadata[] => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
    return searchFiles({ ...searchFilters, ...filters });
  }, [searchFilters, searchFiles]);

  // Selection
  const selectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => [...prev, fileId]);
  }, []);

  const deselectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  }, []);

  const selectAllFiles = useCallback(() => {
    const currentFiles = files.filter(file => 
      currentFolder === 'root' ? !file.folderId : file.folderId === currentFolder
    );
    setSelectedFiles(currentFiles.map(f => f.id));
  }, [files, currentFolder]);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Navigation
  const navigateToFolder = useCallback((folderId: string) => {
    setCurrentFolder(folderId);
    clearSelection();
  }, [clearSelection]);

  const navigateBack = useCallback(() => {
    if (currentFolder !== 'root') {
      const parentFolder = folders.find(f => f.id === currentFolder);
      setCurrentFolder(parentFolder?.parentId || 'root');
    }
  }, [currentFolder, folders]);

  // Sharing
  const shareFiles = useCallback(async (fileIds: string[], settings: ShareSettings): Promise<void> => {
    setFiles(prev => prev.map(file => 
      fileIds.includes(file.id) 
        ? { 
            ...file, 
            shared: settings.isPublic,
            sharedWith: settings.sharedWith
          }
        : file
    ));
  }, []);

  const unshareFiles = useCallback(async (fileIds: string[]): Promise<void> => {
    setFiles(prev => prev.map(file => 
      fileIds.includes(file.id) 
        ? { 
            ...file, 
            shared: false,
            sharedWith: []
          }
        : file
    ));
  }, []);

  // Storage
  const getStorageUsage = useCallback(() => {
    const used = files.reduce((acc, file) => acc + (file.size || 0), 0);
    return {
      used,
      available: MAX_STORAGE - used,
      percentage: (used / MAX_STORAGE) * 100
    };
  }, [files]);

  const getFolderSize = useCallback((folderId: string): number => {
    return files
      .filter(file => file.folderId === folderId)
      .reduce((acc, file) => acc + (file.size || 0), 0);
  }, [files]);

  // Batch operations
  const batchClassify = useCallback(async (fileIds: string[]): Promise<void> => {
    // Simulate batch classification
    for (const fileId of fileIds) {
      await classifyFile(fileId);
    }
  }, []);

  const batchDownload = useCallback(async (fileIds: string[]): Promise<void> => {
    const filesToDownload = files.filter(file => fileIds.includes(file.id));
    
    for (const file of filesToDownload) {
      // Create download link
      const link = document.createElement('a');
      link.href = file.thumbnail || '#';
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [files]);

  const batchTag = useCallback(async (fileIds: string[], tagIds: string[]): Promise<void> => {
    setFiles(prev => prev.map(file => 
      fileIds.includes(file.id) 
        ? {
            ...file,
            tags: [
              ...file.tags.filter(tag => !tagIds.includes(tag.id)),
              ...tags.filter(tag => tagIds.includes(tag.id))
            ]
          }
        : file
    ));
  }, [tags]);

  // Helper function for classification
  const classifyFile = useCallback(async (fileId: string): Promise<void> => {
    // Simulate AI classification
    const foodNames = ['Apple', 'Banana', 'Pizza', 'Burger', 'Salad', 'Pasta', 'Sushi', 'Taco'];
    const categories = ['Fruit', 'Fast Food', 'Healthy', 'International'];
    
    const foodName = foodNames[Math.floor(Math.random() * foodNames.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const confidence = 0.7 + Math.random() * 0.3;

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? {
            ...file,
            classification: {
              foodName,
              confidence,
              category
            }
          }
        : file
    ));
  }, []);

  return {
    files,
    folders,
    tags,
    selectedFiles,
    currentFolder,
    uploadProgress,
    searchFilters,
    
    uploadFiles,
    deleteFiles,
    moveFiles,
    copyFiles,
    renameFile,
    
    createFolder,
    deleteFolder,
    renameFolder,
    
    addTag,
    removeTag,
    addTagToFile,
    removeTagFromFile,
    
    searchFiles,
    filterFiles,
    
    selectFile,
    deselectFile,
    selectAllFiles,
    clearSelection,
    
    navigateToFolder,
    navigateBack,
    
    shareFiles,
    unshareFiles,
    
    getStorageUsage,
    getFolderSize,
    
    batchClassify,
    batchDownload,
    batchTag
  };
};

export default useFileManagement;
