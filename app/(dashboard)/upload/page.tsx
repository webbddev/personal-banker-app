'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import {
  useFileUpload,
  type FileWithPreview,
  formatBytes,
} from '@/hooks/use-file-upload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  FileTextIcon,
  ImageIcon,
  Download,
  CloudUpload,
  FileArchiveIcon,
  FolderOpen,
  FileIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

interface FileUploadItem extends FileWithPreview {
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'deleting';
  error?: string;
  documentId?: string;
}

export default function UploadPage() {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const processedFiles = useRef(new Set<string>());

  // Load existing documents
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch('/api/documents');
        if (!res.ok) throw new Error('Failed to fetch documents');
        
        const data = await res.json();
        const existing = data.map((doc: any) => ({
          id: doc.id,
          documentId: doc.id,
          file: new File([], doc.filename, { type: doc.fileType }),
          preview: doc.blobUrl,
          progress: 100,
          status: 'completed' as const,
        }));
        setUploadFiles(existing);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsSyncing(false);
      }
    }
    loadDocs();
  }, []);

  const updateFileStatus = useCallback(
    (id: string, updates: Partial<FileUploadItem>) => {
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const startVercelUpload = async (fileItem: FileWithPreview) => {
    try {
      if (!(fileItem.file instanceof File)) {
        throw new Error('Invalid file object');
      }

      // Upload to Vercel Blob
      const blob = await upload(fileItem.file.name, fileItem.file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (p) =>
          updateFileStatus(fileItem.id, { progress: p.percentage }),
      });

      // Save to database
      const dbResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobUrl: blob.url,
          filename: fileItem.file.name,
          fileType: fileItem.file.type,
          fileSize: fileItem.file.size,
        }),
      });

      if (!dbResponse.ok) throw new Error('Database sync failed');
      const savedDoc = await dbResponse.json();

      // Update state with real DB ID
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'completed' as const,
                documentId: savedDoc.id,
                id: savedDoc.id,
                preview: blob.url,
              }
            : f
        )
      );
    } catch (err) {
      console.error('Upload error:', err);
      updateFileStatus(fileItem.id, {
        status: 'error',
        error: 'Upload failed',
      });
    }
  };

  const handleDelete = async (fileItem: FileUploadItem) => {
    const idToDelete = fileItem.documentId || fileItem.id;

    if (!idToDelete) {
      console.error('No valid ID to delete');
      return;
    }

    // Show deleting status
    updateFileStatus(fileItem.id, { status: 'deleting' });

    try {
      const response = await fetch(`/api/documents/${idToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete document');
      }

      // Remove from UI
      setUploadFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      console.log('✅ File deleted successfully:', fileItem.file.name);
    } catch (error) {
      console.error('❌ Delete error:', error);
      updateFileStatus(fileItem.id, {
        status: 'error',
        error: 'Delete failed',
      });
      alert(`Failed to delete ${fileItem.file.name}. Please try again.`);
    }
  };

  const [
    { isDragging },
    {
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    onFilesChange: (newFiles) => {
      // Prevent duplicate processing
      const uniqueNewFiles = newFiles.filter(
        (f) => !processedFiles.current.has(f.id)
      );

      if (uniqueNewFiles.length === 0) return;

      uniqueNewFiles.forEach((f) => processedFiles.current.add(f.id));

      setUploadFiles((prev) => [
        ...prev,
        ...uniqueNewFiles.map((f) => ({
          ...f,
          progress: 0,
          status: 'uploading' as const,
        })),
      ]);

      uniqueNewFiles.forEach(startVercelUpload);
    },
  });

  const getIcon = (type: string) => {
    if (type.includes('image'))
      return <ImageIcon className='size-5 text-blue-500' />;
    if (type.includes('pdf'))
      return <FileTextIcon className='size-5 text-red-500' />;
    if (type.includes('zip') || type.includes('archive'))
      return <FileArchiveIcon className='size-5 text-yellow-500' />;
    return <FileIcon className='size-5 text-gray-500' />;
  };

  const completedFiles = uploadFiles.filter((f) => f.status === 'completed');
  const uploadingFiles = uploadFiles.filter((f) => f.status === 'uploading');

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Documents' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          {/* Constrained width container for better large screen experience */}
          <div className='w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6'>
            {/* Header Stats */}
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  File Storage
                </h2>
                <p className='text-sm text-muted-foreground mt-1'>
                  {completedFiles.length} {completedFiles.length === 1 ? 'file' : 'files'} stored
                </p>
              </div>
              <Button onClick={openFileDialog} size='sm'>
                <CloudUpload className='size-4 mr-2' />
                Upload Files
              </Button>
            </div>

            {/* Dropzone - Modern card style */}
            <div
              className={cn(
                'relative rounded-xl border-2 border-dashed p-16 text-center transition-all cursor-pointer group',
                'hover:border-primary/50 hover:bg-accent/5',
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border'
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input {...getInputProps()} className='hidden' />
              <div className='flex flex-col items-center gap-4'>
                <div className='p-4 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors'>
                  <CloudUpload className='h-8 w-8 text-primary' />
                </div>
                <div className='space-y-2'>
                  <p className='text-base font-medium'>
                    Drag and drop files here
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    or click to browse your computer
                  </p>
                </div>
                <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                  <span>PDF, Images, Archives</span>
                  <span>•</span>
                  <span>Max 50MB</span>
                </div>
              </div>
            </div>

            {/* Active Uploads */}
            {uploadingFiles.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-muted-foreground'>
                  Uploading ({uploadingFiles.length})
                </h3>
                <div className='space-y-2'>
                  {uploadingFiles.map((file) => (
                    <div
                      key={file.id}
                      className='flex items-center gap-4 p-4 rounded-lg border bg-card'
                    >
                      <div className='flex-shrink-0'>
                        {getIcon(file.file.type)}
                      </div>
                      <div className='flex-1 min-w-0 space-y-2'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium truncate'>
                            {file.file.name}
                          </p>
                          <span className='text-xs text-muted-foreground ml-2'>
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                        <div className='h-1.5 bg-secondary rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-primary transition-all duration-300 ease-out'
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Table */}
            {isSyncing ? (
              <div className='flex items-center justify-center py-16'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                  <p className='text-sm text-muted-foreground'>
                    Loading your files...
                  </p>
                </div>
              </div>
            ) : completedFiles.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='p-4 rounded-full bg-muted mb-4'>
                  <FolderOpen className='h-8 w-8 text-muted-foreground' />
                </div>
                <h3 className='text-lg font-medium mb-1'>No files yet</h3>
                <p className='text-sm text-muted-foreground max-w-sm'>
                  Upload your first file by dragging and dropping or clicking the upload button
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-muted-foreground'>
                  All Files ({completedFiles.length})
                </h3>
                <div className='border rounded-lg overflow-hidden bg-card'>
                  <Table>
                    <TableHeader>
                      <TableRow className='hover:bg-transparent'>
                        <TableHead className='w-[50%]'>Name</TableHead>
                        <TableHead className='w-[15%]'>Size</TableHead>
                        <TableHead className='w-[20%]'>Status</TableHead>
                        <TableHead className='w-[15%] text-right'>
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedFiles.map((file) => (
                        <TableRow key={file.id} className='group'>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              {getIcon(file.file.type)}
                              <span className='font-medium truncate max-w-md'>
                                {file.file.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {formatBytes(file.file.size)}
                          </TableCell>
                          <TableCell>
                            {file.status === 'completed' ? (
                              <Badge
                                variant='secondary'
                                className='bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0'
                              >
                                Uploaded
                              </Badge>
                            ) : file.status === 'deleting' ? (
                              <Badge variant='secondary'>Deleting...</Badge>
                            ) : (
                              <Badge variant='destructive'>
                                {file.error || 'Failed'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-1'>
                              {file.preview && (
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  asChild
                                >
                                  <Link
                                    href={file.preview}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                  >
                                    <Download className='h-4 w-4' />
                                  </Link>
                                </Button>
                              )}
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleDelete(file)}
                                disabled={file.status === 'deleting'}
                                className='h-8 w-8 hover:text-destructive'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}