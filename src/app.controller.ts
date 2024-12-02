import { Controller, Get, Query } from '@nestjs/common';
import { SemanticSearch } from './useCase/SemanticSearchRequest';

@Controller()
export class AppController {
  constructor(private readonly semanticSearch: SemanticSearch) {}

  @Get('search')
  async search(@Query('q') query: string) {
    const searchResults = await this.semanticSearch.execute(query);
    return searchResults;
  }
}
