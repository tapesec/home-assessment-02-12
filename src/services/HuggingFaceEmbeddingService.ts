import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { HuggingFaceClient } from './HuggingFaceClient';

@Injectable()
export class HuggingFaceEmbeddingService {
  private hf: HfInference;

  constructor(private huggingFaceClient: HuggingFaceClient) {}

  /**
   * Generate embedding for a given text
   * @param text - text
   * @returns a vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.huggingFaceClient
        .getClient()
        .featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: text,
        });
      if (!Array.isArray(result)) {
        throw new Error('Unexpected response format from Hugging Face API');
      }

      return result as number[];
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
