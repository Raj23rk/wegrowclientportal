import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (
      supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes('your-project') &&
      !supabaseKey.includes('your-supabase')
    ) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey);
        this.isConfigured = true;
        this.logger.log('Supabase client successfully initialized');
      } catch (err) {
        this.logger.warn(`Failed to initialize Supabase client: ${err.message}`);
      }
    } else {
      this.logger.log(
        'Supabase URL or Key not set to live credentials; running in mock storage mode'
      );
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isConfigured && this.client !== null;
  }

  async uploadDocument(
    bucket: string,
    path: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<{ path: string; url?: string } | null> {
    if (!this.client) {
      this.logger.log(`Mock upload to bucket "${bucket}" at path "${path}"`);
      return { path, url: `/mock-storage/${bucket}/${path}` };
    }

    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, fileBuffer, { contentType, upsert: true });

      if (error) {
        this.logger.error(`Supabase upload error: ${error.message}`);
        return null;
      }

      const { data: publicUrlData } = this.client.storage.from(bucket).getPublicUrl(path);
      return { path: data.path, url: publicUrlData.publicUrl };
    } catch (err) {
      this.logger.error(`Error uploading to Supabase: ${err.message}`);
      return null;
    }
  }

  async getFileSignedUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!this.client) {
      return `/mock-storage/${bucket}/${path}`;
    }

    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error) {
        this.logger.error(`Supabase signed url error: ${error.message}`);
        return null;
      }
      return data.signedUrl;
    } catch (err) {
      this.logger.error(`Error getting signed URL: ${err.message}`);
      return null;
    }
  }
}
