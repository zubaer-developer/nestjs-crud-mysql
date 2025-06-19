import { Injectable } from '@nestjs/common';
import { mkdir, access } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  async onModuleInit() {
    await this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory() {
    try {
      await access(this.uploadPath);
    } catch {
      await mkdir(this.uploadPath, { recursive: true });
    }
  }
}
