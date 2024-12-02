import { Injectable } from '@nestjs/common';
import { HuggingFaceEmbeddingService } from '../services/HuggingFaceEmbeddingService';
import { PineconeService } from '../services/PineconeService';

@Injectable()
export class SemanticSearch {
  constructor(
    private readonly embeddingService: HuggingFaceEmbeddingService,
    private readonly pineconeService: PineconeService,
  ) {}
  async execute(query: string) {
    if (!query) {
      throw new Error('Q parameter required');
    }
    const MAX_RESULTS = 10;

    const PINECONE_INDEX_NAME = 'assessment-rss';
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    const searchResults = await this.pineconeService.searchVectors(
      PINECONE_INDEX_NAME,
      queryEmbedding,
      MAX_RESULTS,
    );

    console.log(searchResults.map((sr) => sr.metadata.link));
    return searchResults.map((sr) => sr.metadata.link);
  }
}
