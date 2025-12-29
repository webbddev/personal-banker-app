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
  Upload,
  FileTextIcon,
  ImageIcon,
  Download,
  RefreshCwIcon,
  CloudUpload,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  VideoIcon,
  HeadphonesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FileUploadItem extends FileWithPreview {
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'deleting';
  error?: string;
  documentId?: string; // The Prisma UUID
}

export default function VercelTableUpload() {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // Use a ref to prevent double-processing the same file object
  const processedFiles = useRef(new Set<string>());

  // Sync with DB on load
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        const existing = data.map((doc: any) => ({
          id: doc.id,
          documentId: doc.id,
          file: new File([], doc.filename, { type: doc.fileType }),
          preview: doc.blobUrl,
          progress: 100,
          status: 'completed',
        }));
        setUploadFiles(existing);
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
      // 1. Upload to Vercel Blob
      if (!(fileItem.file instanceof File)) {
        throw new Error('Invalid file object');
      }
      const blob = await upload(fileItem.file.name, fileItem.file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (p) =>
          updateFileStatus(fileItem.id, { progress: p.percentage }),
      });

      // 2. Immediate Client-Side DB Sync (required for Localhost)
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

      // 3. Finalize State with real ID
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'completed',
                documentId: savedDoc.id,
                id: savedDoc.id, // Replace temp ID with real DB ID
                preview: blob.url,
              }
            : f
        )
      );
    } catch (err) {
      updateFileStatus(fileItem.id, {
        status: 'error',
        error: 'Upload failed',
      });
    }
  };

  const handleDelete = async (fileItem: FileUploadItem) => {
    // Use documentId if available, otherwise fall back to id
    const idToDelete = fileItem.documentId || fileItem.id;

    if (!idToDelete) {
      console.error('No valid ID to delete');
      return;
    }

    // Optimistically update UI
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === fileItem.id
          ? { ...f, status: 'uploading' as const } // Show loading state
          : f
      )
    );

    try {
      const response = await fetch(`/api/documents/${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete document');
      }

      // Remove from UI on success
      setUploadFiles((prev) => prev.filter((f) => f.id !== fileItem.id));

      console.log('✅ File deleted successfully:', fileItem.file.name);
    } catch (error) {
      console.error('❌ Delete error:', error);

      // Restore the file status on error
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: 'error' as const, error: 'Delete failed' }
            : f
        )
      );

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
      // Filter out files we've already started processing to prevent triplicates
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

  // UI Helpers
  const getIcon = (type: string) => {
    if (type.includes('image'))
      return <ImageIcon className='size-4 text-blue-500' />;
    if (type.includes('pdf'))
      return <FileTextIcon className='size-4 text-red-500' />;
    return <FileArchiveIcon className='size-4 text-muted-foreground' />;
  };

  return (
    <div className='w-full max-w-4xl mx-auto p-6 space-y-6'>
      <div
        className={cn(
          'p-12 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer',
          isDragging
            ? 'bg-primary/5 border-primary'
            : 'bg-card border-border hover:border-primary/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input {...getInputProps()} className='hidden' />
        <CloudUpload className='mx-auto h-10 w-10 text-muted-foreground mb-4' />
        <p className='text-sm'>
          Drop files or <span className='text-primary font-medium'>browse</span>
        </p>
      </div>

      <div className='border rounded-md bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isSyncing ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center py-10 animate-pulse'
                >
                  Loading storage...
                </TableCell>
              </TableRow>
            ) : uploadFiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center py-10 text-muted-foreground'
                >
                  No files uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              uploadFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className='flex items-center gap-3'>
                    {getIcon(file.file.type)}
                    <span className='truncate max-w-[200px] font-medium'>
                      {file.file.name}
                    </span>
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {formatBytes(file.file.size)}
                  </TableCell>
                  <TableCell>
                    {file.status === 'completed' ? (
                      <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-200'>
                        Success
                      </Badge>
                    ) : file.status === 'error' ? (
                      <Badge variant='destructive'>Failed</Badge>
                    ) : (
                      <span className='text-xs font-mono'>
                        {Math.round(file.progress)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      {file.preview && (
                        <Button
                          variant='ghost'
                          size='icon'
                          asChild
                          className='h-8 w-8'
                        >
                          <Link href={file.preview} target='_blank'>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
