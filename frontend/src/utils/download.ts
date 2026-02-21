import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import { haptics } from './haptics';
import { toast } from 'react-hot-toast';

// Helper to get Base64 string from various input types
const getDataAsBase64 = async (input: any): Promise<string> => {
    // 0. Handle JSON object with pdfBase64 (New API format)
    if (input && typeof input === 'object' && input.pdfBase64) {
        return input.pdfBase64;
    }

    // 1. If it's already a base64 string
    if (typeof input === 'string') {
        // If it looks like a raw PDF or contains binary-like characters that aren't base64, convert it
        if (input.startsWith('%PDF')) {
            console.log('Detected raw PDF string, converting to Base64');
            // Convert binary string to Base64 safely
            const len = input.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = input.charCodeAt(i);
            }

            // Convert bytes to binary string
            let binary = '';
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }

        // Remove data URI prefix if present (e.g., "data:application/pdf;base64,")
        if (input.includes(';base64,')) {
            return input.split(';base64,')[1];
        }
        return input;
    }

    // 2. If it's a Blob
    if (input instanceof Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
            reader.readAsDataURL(input);
        });
    }

    // 3. If it's an ArrayBuffer
    if (input instanceof ArrayBuffer) {
        const blob = new Blob([input]);
        return getDataAsBase64(blob); // Recursively handle as Blob
    }

    // 4. Fallback: try to convert to JSON string (error case?) or just return empty
    console.warn('Unknown data type for download:', typeof input, input);
    throw new Error('Unsupported data type for download');
};

// Helper to convert Base64 string to Blob
const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

export const downloadFile = async (data: any, filename: string, mimeType: string) => {
    try {
        // Get Base64 string (handles JSON, string, Blob, ArrayBuffer)
        const base64Data = await getDataAsBase64(data);

        // Validate Base64
        if (!base64Data || base64Data.length === 0) {
            throw new Error('Converted Base64 data is empty');
        }

        if (Capacitor.isNativePlatform()) {
            let fileUri = '';

            try {
                // Try Documents first
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });
                fileUri = savedFile.uri;
            } catch (docError: any) {
                console.warn('Documents write failed:', docError);

                // Fallback to Cache
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Data,
                    directory: Directory.Cache
                });
                fileUri = savedFile.uri;
            }

            haptics.success();

            // Open the file
            try {
                await FileOpener.open({
                    filePath: fileUri,
                    contentType: mimeType
                });
            } catch (openError) {
                console.error('Error opening file:', openError);
                toast.error(`File saved but could not be opened.\nLocation: ${fileUri}`);
            }

            return fileUri;
        } else {
            // Web fallback: Convert Base64 back to Blob
            const blob = base64ToBlob(base64Data, mimeType);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        }
    } catch (error: any) {
        console.error('Download error:', error);
        haptics.error();
        toast.error(`Download failed: ${error.message || JSON.stringify(error)}`);
        throw error;
    }
};
