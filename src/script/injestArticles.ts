import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { RSSReaderService } from '../services/RSSReader';
import { HuggingFaceEmbeddingService } from '../services/HuggingFaceEmbeddingService';
import { PineconeService } from '../services/PineconeService';
import { v4 as uuidv4 } from 'uuid';
import { HuggingFaceClient } from '../services/HuggingFaceClient';

const PINECONE_INDEX_NAME = 'assessment-rss';

(async () => {
  const configService = new ConfigService({
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  });

  const rssReaderService = new RSSReaderService();
  const huggingFaceClient = new HuggingFaceClient(configService);
  const embeddingService = new HuggingFaceEmbeddingService(huggingFaceClient);
  const pineconeService = new PineconeService(configService);

  const responses = await Promise.all([
    rssReaderService.fetch('https://www.public.fr/feed'),
    rssReaderService.fetch('https://vsd.fr/feed/'),
  ]);

  const articles = responses.flat();

  if (articles.length === 0) {
    console.log('No articles in RSS feeds');
    return process.exit(0);
  }

  const vectors = await Promise.all(
    articles.map(async (article) => {
      await sleep(250);
      const embedding = await embeddingService.generateEmbedding(
        article.content || '',
      );
      return {
        id: uuidv4(),
        vector: embedding,
        metadata: { link: article.link },
      };
    }),
  );

  await pineconeService.upsertVectors(PINECONE_INDEX_NAME, vectors);
  // In real case I would store articles data in traditional database and fetch content from it based on uuid..
})();

export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
