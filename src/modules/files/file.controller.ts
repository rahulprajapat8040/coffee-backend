import {
  Controller,
  Delete,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service.js';
import { multerConfig } from '../../multer.config.js';
import { responseSender } from '../../utils/helper/function.helper.js';

@ApiTags('File And Media Management APIs')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-media-file')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'folder',
    description: 'folder name in which want to save file',
    example: 'children',
    required: false,
  })
  @ApiBody({
    description: 'Media file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media uploaded successfully',
    schema: {
      example: {
        message: 'Media Uploaded',
        success: true,
        data: {
          url: 'uploads/file123.png',
          originalName: 'file123.png',
        },
      },
    },
  })
  uploadMedia(@UploadedFile() file: Express.Multer.File) {
    return responseSender('Media Uploaded', HttpStatus.CREATED, true, {
      url: file.path,
      originalName: file.originalname,
    });
  }

  @Delete('delete-by-url')
  @ApiOperation({ summary: 'Delete media by URL' })
  @ApiQuery({
    name: 'url',
    description: 'URL of the media to delete',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media deleted successfully',
    schema: {
      example: {
        message: 'Media deleted',
        success: true,
        data: null,
      },
    },
  })
  deleteMediaByUrl(@Query('url') url: string) {
    return this.fileService.deleteMediaByUrl(url);
  }
}