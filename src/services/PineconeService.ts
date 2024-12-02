import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {
  private client: Pinecone;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    this.client = new Pinecone({ apiKey: apiKey });
  }

  /**
   * Search for similar vectors
   * @param indexName - indexName
   * @param vector - vector
   * @param topK - number of results
   */
  async searchVectors(indexName: string, vector: number[], topK: number = 10) {
    try {
      const index = this.client.Index(indexName);
      const queryResult = await index.query({
        vector: vector,
        topK: topK,
        includeValues: false,
        includeMetadata: true,
      });

      return queryResult.matches.map((m) => ({
        id: m.id,
        score: m.score,
        metadata: m.metadata,
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche dans Pinecone:', error);
      throw error;
    }
  }

  /**
   * Indev a vector
   * @param indexName - Index name
   * @param id - unique element id
   * @param vector - vector
   * @param metadata - related metadata
   */
  async upsertVectors(
    indexName: string,
    vectorsAndMetadata: { id: string; vector: number[]; metadata: any }[],
  ) {
    try {
      const index = this.client.Index(indexName);
      await index.upsert(
        vectorsAndMetadata.map((vm) => ({
          id: vm.id,
          values: vm.vector,
          metadata: vm.metadata,
        })),
      );
      console.log(`${vectorsAndMetadata.length} Vectors upserted successfully`);
    } catch (error) {
      console.error('Error upserting vectors to Pinecone:', error);
      throw error;
    }
  }
}
