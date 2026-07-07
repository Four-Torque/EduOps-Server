import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ClassFileController } from './controller/class-file.controller';
import { ClassFileService } from './service/class-file.service';
import { ClassFileRepository } from './repository/class-file.repository';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/class-files',
        filename: (req, file, cb) => {
          // 파일명 중복을 피하기 위해 타임스탬프와 랜덤 문자열을 원본 파일명 앞에 붙입니다.
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const name = path.basename(file.originalname, ext);
          cb(null, `${name}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 제한
      },
    }),
  ],
  controllers: [ClassFileController],
  providers: [ClassFileService, ClassFileRepository],
  exports: [ClassFileService],
})
export class ClassFileModule {}
