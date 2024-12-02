## Explanations

There is the following main components

- `injestArticles` -> the script to get articles from vsd and public rss feeds
- `SemanticSearchRequest` -> the use case responsible for handling user search requests
- 2 key services:
  - `HuggingFaceEmbeddingService`, responsible for creating embeddings.
  - `PineconeService`, responsible for storing and retrieving vectors.

## Project setup

```bash
$ yarn install
```

```bash
$ yarn start:dev
```

Then go to localhost:3000, and start playing with it

I've already run

The last `vsd` and `public` articles from rss feed are already indexed in the database.

To do that I executed

```bash
$ yarn injest
```

You don't need to do it twice.
