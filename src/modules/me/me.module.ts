import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  imports: [MulterModule.register()],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
