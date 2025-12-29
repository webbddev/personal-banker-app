'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { type PutBlobResult } from '@vercel/blob';

export default function Home() {
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = () => {
    if (htmlInputRef.current?.files?.[0]) {
      setSelectedFileName(htmlInputRef.current.files[0].name);
    } else {
      setSelectedFileName(null);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProgress(0);
    setUploading(true);

    if (!htmlInputRef.current?.files) {
      throw new Error('Select a file to continue!');
    }

    const file = htmlInputRef.current?.files[0];

    try {
      const blobUrl = await upload(`projects/projectId/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
          setProgress(progressEvent.percentage);
        },
      });
      setBlob(blobUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='w-full max-w-md p-8 bg-white rounded-xl shadow-lg'>
        <h1 className='text-3xl font-bold text-center text-indigo-700 mb-8'>
          File Upload
        </h1>

        <form onSubmit={handleFormSubmit} className='space-y-6'>
          <div className='border-2 border-dashed border-indigo-200 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors'>
            <input
              name='file'
              ref={htmlInputRef}
              type='file'
              accept='image/jpeg, image/png, image/gif'
              required
              className='hidden'
              id='file-upload'
              disabled={uploading}
              onChange={handleFileChange}
            />
            <label
              htmlFor='file-upload'
              className='cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium'
            >
              {selectedFileName || 'Choose a file to upload'}
            </label>
          </div>

          {uploading && (
            <div className='w-full bg-gray-200 rounded-full h-2.5'>
              <div
                className='bg-indigo-600 h-2.5 rounded-full transition-all duration-300'
                style={{ width: `${progress}%` }}
              ></div>
              <p className='text-sm text-gray-500 mt-2 text-center'>
                {Math.round(progress)}% uploaded
              </p>
            </div>
          )}

          <button
            type='submit'
            className='w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors disabled:bg-indigo-300'
            disabled={uploading || !selectedFileName}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>

        {blob && (
          <div className='mt-8 p-4 bg-green-50 rounded-lg border border-green-200'>
            <p className='text-green-700 font-medium mb-2'>
              Upload successful!
            </p>
            <p className='text-sm text-gray-700 break-all'>
              File URL:{' '}
              <a
                href={blob.url}
                className='text-indigo-600 hover:underline'
                target='_blank'
                rel='noopener noreferrer'
              >
                {blob.url}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
