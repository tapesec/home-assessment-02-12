import { Injectable } from '@nestjs/common';
import { extract } from '@extractus/feed-extractor';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class RSSReaderService {
  constructor() {}

  private sanitizeAndClean(content: string): string {
    if (!content) return '';
    const sanitized = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
    });
    return sanitized.replace(/\n/g, ' ').trim();
  }

  private parseRSSItem(item: any): RSSItem {
    return {
      title: item.title || 'Titre non disponible',
      link: item.link || '',
      author: item.author,
      pubDate: item.pubDate ? new Date(item.pubDate) : null,
      categories: item.categories,
      content: this.sanitizeAndClean(item.content || ''),
    };
  }

  async fetch(url: string) {
    try {
      const response = await extract(url, {
        getExtraEntryFields: (feedData) => {
          return {
            content: feedData['content:encoded'],
            categories: feedData['category'],
            author: feedData['dc:creator'],
            pubDate: feedData['pubDate'],
          };
        },
      });

      return response.entries.map<RSSItem>((item) => this.parseRSSItem(item));
    } catch (error) {
      console.error(`Error fetching RSS feed from ${url}:`, error);
      throw new Error(`Could not fetch RSS feed: ${error.message}`);
    }
  }
}

interface RSSItem {
  title: string;
  link: string;
  author: string | undefined;
  pubDate: Date | null;
  categories: string[];
  content: string;
}
