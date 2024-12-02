import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HuggingFaceClient {
  private hf: HfInference;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    if (!apiKey) {
      throw new Error(
        'HUGGINGFACE_API_KEY is not defined in environment variables',
      );
    }

    this.hf = new HfInference(apiKey);
  }

  getClient() {
    return this.hf;
  }
}
