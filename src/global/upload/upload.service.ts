import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
@Injectable()
export class UploadService {
  constructor(
    @Inject('AZURE_BLOB_CLIENT') private storage: BlobServiceClient,
    private configService: ConfigService,
  ) {}

  async uploadToBucket(file: Express.Multer.File): Promise<string> {
    if (!file.buffer) {
      throw new InternalServerErrorException(
        'Invalid file data: Buffer is missing.',
      );
    }

    const extension = file.mimetype.split('/')[1];
    const name = file.originalname.split('.').slice(0, -1).join('.');
    const blobName = `${name}${extension ? '.' + extension : ''}`;
    const containerClient = this.storage.getContainerClient(
      this.configService.get<string>('blob.name')!,
    );

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });
    return blockBlobClient.url;
  }
}
