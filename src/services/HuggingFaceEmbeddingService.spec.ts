import { Test, TestingModule } from '@nestjs/testing';
import { HuggingFaceEmbeddingService } from './HuggingFaceEmbeddingService';
import { HuggingFaceClient } from './HuggingFaceClient';
import { HfInference } from '@huggingface/inference';
import { ConfigService } from '@nestjs/config';

describe('HuggingFaceEmbeddingService', () => {
  let service: HuggingFaceEmbeddingService;
  let huggingFaceClient: HuggingFaceClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HuggingFaceEmbeddingService,
        HuggingFaceClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-key'),
          },
        },
      ],
    }).compile();

    service = module.get(HuggingFaceEmbeddingService);
    huggingFaceClient = module.get(HuggingFaceClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should successfully generate embedding', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockText = 'test text';
      jest.spyOn(huggingFaceClient, 'getClient').mockImplementation(
        () =>
          ({
            featureExtraction: jest.fn().mockResolvedValue(mockEmbedding),
          }) as unknown as HfInference,
      );

      const result = await service.generateEmbedding(mockText);

      expect(result).toEqual(mockEmbedding);
    });

    it('should throw error when API response is not an array', async () => {
      const mockText = 'test text';
      jest.spyOn(huggingFaceClient, 'getClient').mockImplementation(
        () =>
          ({
            featureExtraction: jest.fn().mockResolvedValue(undefined),
          }) as unknown as HfInference,
      );

      await expect(service.generateEmbedding(mockText)).rejects.toThrow(
        'Failed to generate embedding',
      );
    });

    it('should throw error when API call fails', async () => {
      const mockText = 'test text';
      jest.spyOn(huggingFaceClient, 'getClient').mockImplementation(
        () =>
          ({
            featureExtraction: jest
              .fn()
              .mockResolvedValue(new Error('API Error')),
          }) as unknown as HfInference,
      );

      await expect(service.generateEmbedding(mockText)).rejects.toThrow(
        'Failed to generate embedding',
      );
    });
  });
});
