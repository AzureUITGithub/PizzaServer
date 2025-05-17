const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
require('dotenv').config();

const accountName = process.env.ACCOUNT_NAME;
const accountKey = process.env.STORAGE_ACCOUNT_KEY;
const containerName = process.env.CONTAINER_NAME;

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadToBlob(fileBuffer, blobName) {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: 'image/jpeg' }
        });
        return blockBlobClient.url;
    } catch (error) {
        if (error.statusCode === 403) {
            throw new Error('Authentication failed: Invalid storage account key');
        }
        throw new Error(`Blob upload error: ${error.message}`);
    }
}

module.exports = { uploadToBlob };