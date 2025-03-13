import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16; // 16 bytes for AES
  private readonly saltLength = 64;
  private readonly tagLength = 16; // 16 bytes for AES-GCM

  constructor(private configService: ConfigService) {
    // In production, this should be stored in a secure key management service
    const key =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      'this_is_a_32_byte_encryption_key_123'; // 32 bytes for AES-256
    this.encryptionKey = Buffer.from(key);
  }

  /**
   * Encrypts data using AES-256-GCM
   * @param data - The data to encrypt
   * @returns The encrypted data with salt, iv, and auth tag
   */
  encrypt(data: string | Buffer): string {
    // Generate a random salt to prevent rainbow table attacks
    const salt = crypto.randomBytes(this.saltLength);

    // Generate a random initialization vector for each encryption
    const iv = crypto.randomBytes(this.ivLength);

    // Derive key using the salt
    const key = crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      10000, // 10000 iterations
      32, // key length: 32 bytes for AES-256
      'sha512',
    );

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt the data
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    let encrypted = cipher.update(dataBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get the authentication tag
    const tag = cipher.getAuthTag();

    // Combine salt, IV, encrypted data, and auth tag
    const result = Buffer.concat([salt, iv, tag, encrypted]).toString('base64');

    return result;
  }

  /**
   * Decrypts data that was encrypted using the encrypt method
   * @param encryptedData - The data to decrypt (base64 string)
   * @returns The decrypted data
   */
  decrypt(encryptedData: string): Buffer {
    // Convert base64 to buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    // Extract the salt, IV, tag, and encrypted data
    const salt = encryptedBuffer.subarray(0, this.saltLength);
    const iv = encryptedBuffer.subarray(
      this.saltLength,
      this.saltLength + this.ivLength,
    );
    const tag = encryptedBuffer.subarray(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength,
    );
    const encrypted = encryptedBuffer.subarray(
      this.saltLength + this.ivLength + this.tagLength,
    );

    // Derive key using the same salt
    const key = crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      10000,
      32,
      'sha512',
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }
}
