import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export default class CustomHttpException implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;

    if (exception.name === 'ThrottlerException')
      throw new HttpException(
        'You have tried too much, please try again later',
        429,
      );

    if (process.env.NODE_ENV === 'development') {
      this.errorDev(status, res, exception);
    } else {
      this.errorProd(status, res, message);
    }
  }

  errorDev(status: number, res: Response, exception: HttpException) {
    res.status(status).json({
      status: status >= 400 && status < 500 ? 'fail' : 'error',
      timestamp: new Date().toISOString(),
      exception,
      message: exception.message,
      code: status,
    });
  }

  errorProd(status: number, res: Response, message: string) {
    res.status(status).json({
      status: status >= 400 && status < 500 ? 'fail' : 'error',
      message,
      code: status,
    });
  }
}
