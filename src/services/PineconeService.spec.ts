import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PineconeService } from './PineconeService';
import { Pinecone } from '@pinecone-database/pinecone';

jest.mock('@pinecone-database/pinecone');

describe('PineconeService', () => {
  let service: PineconeService;
  let mockIndex: any;

  beforeEach(async () => {
    mockIndex = {
      query: jest.fn(),
      upsert: jest.fn(),
    };

    (Pinecone as jest.Mock).mockImplementation(() => ({
      Index: jest.fn().mockReturnValue(mockIndex),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PineconeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-pinecone-key'),
          },
        },
      ],
    }).compile();

    service = module.get<PineconeService>(PineconeService);
  });

  describe('searchVectors', () => {
    it('should successfully return matches', async () => {
      const mockMatches = [
        { id: '1', score: 0.9, metadata: { title: 'Test' } },
      ];
      mockIndex.query.mockResolvedValue({ matches: mockMatches });

      const result = await service.searchVectors('test-index', [0.1, 0.2], 5);
      expect(result).toEqual(mockMatches);
    });

    it('should handle search errors', async () => {
      mockIndex.query.mockRejectedValue(new Error('Search failed'));
      await expect(
        service.searchVectors('test-index', [0.1, 0.2], 5),
      ).rejects.toThrow();
    });
  });

  describe('upsertVectors', () => {
    it('should upsert vectors successfully', async () => {
      const vectorsData = [
        {
          id: '1',
          vector: [0.1, 0.2],
          metadata: { title: 'Test' },
        },
      ];

      mockIndex.upsert.mockResolvedValue({ upsertedCount: 1 });
      await expect(
        service.upsertVectors('test-index', vectorsData),
      ).resolves.not.toThrow();
    });

    it('should handle upsert errors', async () => {
      mockIndex.upsert.mockRejectedValue(new Error('Upsert failed'));
      await expect(service.upsertVectors('test-index', [])).rejects.toThrow();
    });
  });
});
