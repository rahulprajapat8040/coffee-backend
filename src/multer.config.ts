import { diskStorage } from 'multer';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';

export const storage = diskStorage({
  destination: (req, file, cb) => {
    let folderName: string | null = null;
    const queryFolder = req.query.folder;
    if (typeof queryFolder === 'string') {
      folderName = queryFolder;
    } else if (
      Array.isArray(queryFolder) &&
      typeof queryFolder[0] === 'string'
    ) {
      folderName = queryFolder[0];
    }

    if (!folderName) {
      folderName = new Date().toISOString().split('T')[0];
    }

    const uploadDir = `./uploads/${folderName}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, randomUUID() + '-' + file.originalname.split(' ').join('-'));
  },
});

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimes = [
    'image/webp',
    'video/mp4',
    'image/jpeg',
    'image/png',
    'application/pdf',
    'image/svg+xml',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // cb(new Error(`Unsupported file type ${file.mimetype}. ` + `Allowed types: ${allowedMimes.join(', ')}`), false);
    cb(null, false);
    throw new BadRequestException(
      `Unsupported file type ${file.mimetype}. Allowed types: ${allowedMimes.join(', ')}`,
    );
  }
};

export const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
};