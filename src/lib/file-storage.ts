import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

export interface FileUploadResult {
  key: string
  url: string
  etag: string
  size: number
  contentType: string
}

export class FileStorageService {
  private s3Client: S3Client
  private bucketName: string

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<FileUploadResult> {
    try {
      const key = `${folder}/${this.generateFileName(fileName)}`
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      })

      const result = await this.s3Client.send(command)

      return {
        key,
        url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        etag: result.ETag || '',
        size: file.length,
        contentType,
      }
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  /**
   * Upload WebAssembly file with validation
   */
  async uploadWasmFile(file: Buffer, fileName: string): Promise<FileUploadResult> {
    // Validate WebAssembly file
    this.validateWasmFile(file)

    return this.uploadFile(file, fileName, 'application/wasm', 'wasm-modules')
  }

  /**
   * Get a presigned URL for file upload
   */
  async getUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${folder}/${this.generateFileName(fileName)}`
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      })

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 })

      return { url, key }
    } catch (error) {
      throw new Error(`Failed to generate upload URL: ${error.message}`)
    }
  }

  /**
   * Get a presigned URL for file download
   */
  async getDownloadUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 })
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`)
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await this.s3Client.send(command)
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  /**
   * Validate WebAssembly file
   */
  private validateWasmFile(file: Buffer): void {
    if (file.length < 8) {
      throw new Error('File too small to be a valid WebAssembly module')
    }

    // Check WebAssembly magic number
    const magic = file.readUInt32LE(0)
    if (magic !== 0x6d736100) {
      throw new Error('Invalid WebAssembly file: wrong magic number')
    }

    // Check WebAssembly version
    const version = file.readUInt32LE(4)
    if (version !== 1) {
      throw new Error(`Unsupported WebAssembly version: ${version}`)
    }

    // Check file size (max 100MB)
    if (file.length > 100 * 1024 * 1024) {
      throw new Error('WebAssembly file too large (max 100MB)')
    }
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = crypto.randomBytes(8).toString('hex')
    const extension = originalName.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }

  /**
   * Get file info from S3
   */
  async getFileInfo(key: string): Promise<{
    size: number
    lastModified: Date
    contentType: string
    etag: string
  }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      const result = await this.s3Client.send(command)

      return {
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        contentType: result.ContentType || 'application/octet-stream',
        etag: result.ETag || '',
      }
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`)
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string): Promise<Array<{
    key: string
    size: number
    lastModified: Date
    etag: string
  }>> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3')
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folder,
      })

      const result = await this.s3Client.send(command)

      return (result.Contents || []).map(object => ({
        key: object.Key || '',
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        etag: object.ETag || '',
      }))
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`)
    }
  }
}

// Singleton instance
export const fileStorage = new FileStorageService()