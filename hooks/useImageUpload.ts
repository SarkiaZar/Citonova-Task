import { useState } from 'react';
import { api } from '../services/api';

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export const useImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (uri: string): Promise<UploadResult> => {
        setUploading(true);
        setError(null);
        try {
            const result = await api.images.upload(uri);
            if (result.success && result.data) {
                return { success: true, url: result.data };
            } else {
                const errorMsg = result.error || 'Failed to upload';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Error occurred';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setUploading(false);
        }
    };

    return {
        uploadImage,
        uploading,
        error
    };
};
