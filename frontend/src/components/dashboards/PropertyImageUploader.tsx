import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useUploadPropertyImagesMutation } from '../../redux/housebank.ts';

interface PropertyImageUploaderProps {
  propertyId: number | string;
  initialNotice?: string;
}

const PropertyImageUploader = ({ propertyId, initialNotice }: PropertyImageUploaderProps) => {
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    () => (initialNotice ? { type: 'error', text: initialNotice } : null)
  );
  const [uploadPropertyImages, { isLoading: uploadingImages }] = useUploadPropertyImagesMutation();

  const handleUploadImages = async () => {
    if (uploadFiles.length === 0) return;

    const formData = new FormData();
    uploadFiles.forEach((file) => formData.append('images', file));
    const result = await uploadPropertyImages({ id: propertyId, formData });

    if ('error' in result) {
      const error: any = result.error;
      setUploadMessage({
        type: 'error',
        text: error?.errors?.images?.[0] || error?.message || 'Could not upload these photos. Please try again.',
      });
      return;
    }

    setUploadFiles([]);
    setUploadMessage({ type: 'success', text: 'Photos uploaded successfully.' });
  };

  return (
    <>
      <div className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center">
        <label className="flex-1 text-sm text-gray-600">
          <span className="mb-1 block font-medium text-gray-700">Add property photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              setUploadFiles(Array.from(event.target.files || []));
              setUploadMessage(null);
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700"
          />
        </label>
        <button
          type="button"
          onClick={handleUploadImages}
          disabled={uploadFiles.length === 0 || uploadingImages}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#58745A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#49634B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploadingImages ? 'Uploading…' : 'Upload photos'}
        </button>
      </div>
      {uploadMessage && (
        <p
          role={uploadMessage.type === 'error' ? 'alert' : 'status'}
          className={`px-4 pb-4 text-sm ${uploadMessage.type === 'error' ? 'text-red-700' : 'text-green-700'}`}
        >
          {uploadMessage.text}
        </p>
      )}
    </>
  );
};

export default PropertyImageUploader;
