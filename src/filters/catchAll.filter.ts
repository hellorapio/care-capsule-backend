import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  NotAcceptableException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export default class CatchAllFilter implements ExceptionFilter {
  catch(exception: Error & { code?: string }, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    console.log(exception);

    if (exception.code === '23503') {
      throw new BadRequestException(
        'You have entered something that does not exist',
      );
    }

    if (exception.code === 'FST_INVALID_MULTIPART_CONTENT_TYPE') {
      throw new NotAcceptableException('An image file is expected');
    }

    if (exception.code === '23502') {
      throw new BadRequestException('Request Body is missing some values');
    }

    if (process.env.NODE_ENV === 'development') {
      return this.errorDev(res, exception);
    } else {
      return this.errorProd(res);
    }
  }

  errorDev(res: Response, exception: Error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      exception,
      message: exception.message,
    });
  }

  errorProd(res: Response) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
}
