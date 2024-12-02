import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { HuggingFaceEmbeddingService } from './services/HuggingFaceEmbeddingService';
import { RSSReaderService } from './services/RSSReader';
import { PineconeService } from './services/PineconeService';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SemanticSearch } from './useCase/SemanticSearchRequest';
import { HuggingFaceClient } from './services/HuggingFaceClient';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
  ],
  controllers: [AppController],
  providers: [
    HuggingFaceClient,
    RSSReaderService,
    HuggingFaceEmbeddingService,
    PineconeService,
    SemanticSearch,
  ],
  exports: [],
})
export class AppModule {}
