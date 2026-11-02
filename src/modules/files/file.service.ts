import { HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { responseSender } from '../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';

@Injectable()
export class FileService {
  constructor() {}

  deleteMediaByUrl(url: string) {
    this.deleteFiles(url);
    return responseSender(
      RESPONSE_MESSAGE.FILE_REMOVED,
      HttpStatus.OK,
      true,
      true,
    );
  }

  private deleteFiles(files: string | string[]) {
    if (!files) {
      console.log('No files provided for deletion');
      return;
    }

    if (Array.isArray(files)) {
      files.forEach((file) => {
        const path = file;
        fs.unlinkSync(path);
        console.log('files deleted');
      });
    } else {
      const path = files;
      fs.unlinkSync(files);
      console.log('files deleted');
    }
  }
}