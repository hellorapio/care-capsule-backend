import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { BlobServiceClient } from '@azure/storage-blob';

@Global()
@Module({})
export class UploadModule {
  static forRoot(): DynamicModule {
    const azureBlobProvider = {
      provide: 'AZURE_BLOB_CLIENT',
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('blob.con');
        if (!connectionString) {
          throw new Error('Azure Blob Storage connection string not provided');
        }
        return BlobServiceClient.fromConnectionString(connectionString);
      },
      inject: [ConfigService],
    };

    return {
      module: UploadModule,
      providers: [azureBlobProvider, UploadService],
      exports: [UploadService],
    };
  }
}
