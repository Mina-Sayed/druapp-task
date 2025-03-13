import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption.service';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter, AllExceptionsFilter } from './http-exception.filter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    EncryptionService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [EncryptionService],
})
export class UtilsModule {}
