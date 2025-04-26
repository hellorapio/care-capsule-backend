import { Body, Controller, Get, Post } from '@nestjs/common';
import Public from './decorators/Public.decorator';

@Controller()
@Public()
export class AppController {
  @Get('health')
  health() {
    return { status: 'server is live' };
  }

  @Post('health')
  getBody(@Body() body: Record<string, any>) {
    return body;
  }
}
