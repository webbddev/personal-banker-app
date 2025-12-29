'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Upload,
  FileTextIcon,
  ImageIcon,
  Download,
  RefreshCwIcon,
  CloudUpload,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  HeadphonesIcon,
  VideoIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

interface FileUploadItem extends FileWithPreview {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

interface ExistingDocument {
  id: string;
  blobUrl: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

export default function VercelTableUpload() {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Fetch existing documents on mount
  useEffect(() => {
    const fetchExistingDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');

        const documents: ExistingDocument[] = await response.json();

        const existingFiles: FileUploadItem[] = documents.map((doc) => {
          // Create a proper File object with size
          const file = new File([], doc.filename, { type: doc.fileType });
          // Override the size property
          Object.defineProperty(file, 'size', {
            value: doc.fileSize,
            writable: false,
          });

          return {
            id: doc.id,
            documentId: doc.id,
            file: file,
            preview: doc.blobUrl,
            progress: 100,
            status: 'completed' as const,
          };
        });

        setUploadFiles(existingFiles);
      } catch (error) {
        console.error('Error fetching existing documents:', error);
      } finally {
        setIsLoadingExisting(false);
      }
    };

    fetchExistingDocuments();
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
    const actualFile = fileItem.file;

    if (!(actualFile instanceof File)) {
      updateFileStatus(fileItem.id, {
        status: 'error',
        error: 'Invalid file object.',
      });
      return;
    }

    try {
      const result = await upload(actualFile.name, actualFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({
          fileType: actualFile.type,
          fileSize: actualFile.size,
        }),
        onUploadProgress: (progressEvent) => {
          updateFileStatus(fileItem.id, {
            progress: progressEvent.percentage,
          });
        },
      });

      // The result from upload should contain the document ID if returned by API
      const documentId = (result as any).newDocument?.id;

      updateFileStatus(fileItem.id, {
        status: 'completed',
        progress: 100,
        preview: result.url,
        documentId: documentId,
      });
    } catch (err) {
      console.error('Upload error:', err);
      updateFileStatus(fileItem.id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  };

  const handleDelete = async (fileItem: FileUploadItem) => {
    if (!fileItem.documentId) {
      setUploadFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      return;
    }

    try {
      const response = await fetch(`/api/documents/${fileItem.documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete document');
      }

      setUploadFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const [
    { isDragging, errors },
    {
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      clearFiles,
    },
  ] = useFileUpload({
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024,
    accept: 'image/*,application/pdf,application/zip',
    onFilesChange: (newFiles) => {
      setUploadFiles((prev) => {
        const trulyNewFiles = newFiles.filter(
          (nf) =>
            !prev.some(
              (ef) =>
                ef.file.name === nf.file.name && ef.file.size === nf.file.size
            )
        );

        if (trulyNewFiles.length === 0) return prev;

        trulyNewFiles.forEach(startVercelUpload);

        return [
          ...prev,
          ...trulyNewFiles.map((f) => ({
            ...f,
            progress: 0,
            status: 'uploading' as const,
          })),
        ];
      });
    },
  });

  const handleClearAll = async () => {
    // Delete all files from server
    const deletePromises = uploadFiles
      .filter((f) => f.documentId)
      .map((f) => handleDelete(f));

    await Promise.all(deletePromises);

    // Clear remaining files from UI
    clearFiles();
    setUploadFiles([]);
  };

  const getFileIcon = (file: File | FileWithPreview['file']) => {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith('image/'))
      return <ImageIcon className='size-4 text-blue-500' />;
    if (type.startsWith('video/'))
      return <VideoIcon className='size-4 text-purple-500' />;
    if (type.startsWith('audio/'))
      return <HeadphonesIcon className='size-4 text-green-500' />;
    if (type.includes('pdf'))
      return <FileTextIcon className='size-4 text-red-500' />;
    if (type.includes('sheet') || type.includes('excel'))
      return <FileSpreadsheetIcon className='size-4 text-green-600' />;
    if (type.includes('zip') || type.includes('rar'))
      return <FileArchiveIcon className='size-4 text-yellow-600' />;
    return <FileTextIcon className='size-4 text-gray-500' />;
  };

  const getFileTypeLabel = (file: File | FileWithPreview['file']) => {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('sheet') || type.includes('excel')) return 'Excel';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    return 'File';
  };

  return (
    <div className='w-full max-w-4xl mx-auto p-6 space-y-6'>
      {/* Dropzone */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-12 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 bg-card'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input {...getInputProps()} className='hidden' />
        <div className='flex flex-col items-center gap-4 pointer-events-none'>
          <div className='p-4 bg-primary/10 rounded-full'>
            <Upload className='h-6 w-6 text-primary' />
          </div>
          <div className='space-y-1'>
            <p className='text-base font-medium text-foreground'>
              Drop files here or{' '}
              <span className='text-primary underline'>browse files</span>
            </p>
            <p className='text-sm text-muted-foreground'>
              Maximum file size: {formatBytes(50 * 1024 * 1024)} • Maximum
              files: 10
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant='destructive'>
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingExisting && (
        <div className='text-center py-8 text-muted-foreground'>
          Loading existing documents...
        </div>
      )}

      {/* Files Table */}
      {!isLoadingExisting && uploadFiles.length > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-foreground'>
              Files ({uploadFiles.length})
            </h3>
            <div className='flex gap-2'>
              <Button onClick={openFileDialog} variant='outline' size='sm'>
                <CloudUpload className='size-4 mr-2' />
                Add files
              </Button>
              <Button onClick={handleClearAll} variant='outline' size='sm'>
                <Trash2 className='size-4 mr-2' />
                Remove all
              </Button>
            </div>
          </div>

          <div className='border border-border rounded-lg overflow-hidden bg-card'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='font-semibold text-foreground'>
                    File Name
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Type
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Size
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Status
                  </TableHead>
                  <TableHead className='font-semibold text-foreground text-right'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadFiles.map((fileItem) => (
                  <TableRow key={fileItem.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div className='relative size-8 flex items-center justify-center'>
                          {fileItem.status === 'uploading' ? (
                            <div className='relative'>
                              <svg
                                className='size-8 -rotate-90'
                                viewBox='0 0 32 32'
                              >
                                <circle
                                  cx='16'
                                  cy='16'
                                  r='14'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  className='text-muted'
                                />
                                <circle
                                  cx='16'
                                  cy='16'
                                  r='14'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeDasharray={`${2 * Math.PI * 14}`}
                                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - fileItem.progress / 100)}`}
                                  className='text-primary transition-all duration-300'
                                  strokeLinecap='round'
                                />
                              </svg>
                              <div className='absolute inset-0 flex items-center justify-center'>
                                {getFileIcon(fileItem.file)}
                              </div>
                            </div>
                          ) : (
                            getFileIcon(fileItem.file)
                          )}
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-foreground truncate max-w-[300px]'>
                            {fileItem.file.name}
                          </span>
                          {fileItem.status === 'error' && (
                            <Badge variant='destructive' className='text-xs'>
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='text-xs'>
                        {getFileTypeLabel(fileItem.file)}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatBytes(fileItem.file.size)}
                    </TableCell>
                    <TableCell>
                      {fileItem.status === 'completed' ? (
                        <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'>
                          Success
                        </Badge>
                      ) : fileItem.status === 'error' ? (
                        <Badge variant='destructive' title={fileItem.error}>
                          Failed
                        </Badge>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-24 bg-muted rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-primary transition-all duration-300'
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                          <span className='text-xs font-medium text-muted-foreground'>
                            {Math.round(fileItem.progress)}%
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-1'>
                        {fileItem.status === 'completed' &&
                          fileItem.preview && (
                            <Button
                              size='icon'
                              variant='ghost'
                              className='size-8 hover:text-primary'
                              asChild
                            >
                              <Link href={fileItem.preview} target='_blank'>
                                <Download className='size-4' />
                              </Link>
                            </Button>
                          )}
                        {fileItem.status === 'error' && (
                          <Button
                            size='icon'
                            variant='ghost'
                            className='size-8 text-primary hover:bg-primary/10'
                            onClick={() => startVercelUpload(fileItem)}
                          >
                            <RefreshCwIcon className='size-4' />
                          </Button>
                        )}
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-8 hover:text-destructive hover:bg-destructive/10'
                          onClick={() => handleDelete(fileItem)}
                        >
                          <Trash2 className='size-4' />
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
  );
}
