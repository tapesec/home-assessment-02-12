import { Test, TestingModule } from '@nestjs/testing';
import { SemanticSearch } from './SemanticSearchRequest';
import { PineconeService } from '../services/PineconeService';
import { HuggingFaceEmbeddingService } from '../services/HuggingFaceEmbeddingService';

describe('SemanticSearch', () => {
  let service: SemanticSearch;
  let embeddingService: HuggingFaceEmbeddingService;
  let pineconeService: PineconeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemanticSearch,
        {
          provide: HuggingFaceEmbeddingService,
          useValue: {
            generateEmbedding: jest.fn(),
          },
        },
        {
          provide: PineconeService,
          useValue: {
            searchVectors: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SemanticSearch>(SemanticSearch);
    embeddingService = module.get(HuggingFaceEmbeddingService);
    pineconeService = module.get(PineconeService);
  });

  describe('execute', () => {
    it('should returns results links', async () => {
      const query = 'test search';
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        {
          id: '1',
          score: 0.9,
          metadata: { link: 'https://example1.com' },
        },
        {
          id: '2',
          score: 0.8,
          metadata: { link: 'https://example2.com' },
        },
      ];

      jest
        .spyOn(embeddingService, 'generateEmbedding')
        .mockResolvedValue(mockEmbedding);
      jest
        .spyOn(pineconeService, 'searchVectors')
        .mockResolvedValue(mockSearchResults);

      const result = await service.execute(query);

      expect(embeddingService.generateEmbedding).toHaveBeenCalledWith(query);
      expect(pineconeService.searchVectors).toHaveBeenCalledWith(
        'assessment-rss',
        mockEmbedding,
        10,
      );
      expect(result).toEqual(['https://example1.com', 'https://example2.com']);
    });

    it('should throw exception when request is empty', async () => {
      await expect(service.execute('')).rejects.toThrow('Q parameter required');
      await expect(service.execute(null)).rejects.toThrow(
        'Q parameter required',
      );
      await expect(service.execute(undefined)).rejects.toThrow(
        'Q parameter required',
      );
    });

    it('should handle embedding service errors', async () => {
      const query = 'recherche test';
      jest
        .spyOn(embeddingService, 'generateEmbedding')
        .mockRejectedValue(new Error('Erreur embedding'));

      await expect(service.execute(query)).rejects.toThrow('Erreur embedding');
    });

    it('should handle pincone service errors', async () => {
      const query = 'recherche test';
      const mockEmbedding = [0.1, 0.2, 0.3];

      jest
        .spyOn(embeddingService, 'generateEmbedding')
        .mockResolvedValue(mockEmbedding);
      jest
        .spyOn(pineconeService, 'searchVectors')
        .mockRejectedValue(new Error('Erreur pinecone'));

      await expect(service.execute(query)).rejects.toThrow('Erreur pinecone');
    });

    it('should handle no result case', async () => {
      const query = 'recherche test';
      const mockEmbedding = [0.1, 0.2, 0.3];

      jest
        .spyOn(embeddingService, 'generateEmbedding')
        .mockResolvedValue(mockEmbedding);
      jest.spyOn(pineconeService, 'searchVectors').mockResolvedValue([]);

      const result = await service.execute(query);

      expect(result).toEqual([]);
    });
  });
});
