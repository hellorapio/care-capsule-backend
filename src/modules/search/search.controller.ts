import { res } from 'src/utils/utils';
import { SearchService } from './search.service';
import { Controller, Get, Query } from '@nestjs/common';
import Public from 'src/decorators/Public.decorator';

@Controller('search')
@Public()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/')
  async search(@Query('q') query: string) {
    const results = await this.searchService.search(query);
    return res(results, 'Search results', 200);
  }
}
