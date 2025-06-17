import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { Response } from 'express';

@Controller('uploads')  // Added 'uploads' prefix to the controller
// This prefix will be used for all routes in this controller, e.g., /uploads/file 
export class UploadController {
  @Post('file')  // Changed from just @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        status: 400,
        message: 'No file uploaded'
      };
    }
    return {
      status: 200,
      message: 'File uploaded successfully',
      filename: file.filename,
      path: file.path
    };
  }

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'uploads', filename));
  }
}