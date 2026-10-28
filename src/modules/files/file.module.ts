import { Global, Module } from "@nestjs/common";
import { FileController } from "./file.controller.js";
import { FileService } from "./file.service.js";

@Global()
@Module({ controllers: [FileController], providers: [FileService] })
export class FileModule {}