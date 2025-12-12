import { PrismaClient } from '@prisma/client';
import { ContentRepository } from './repository';
import { JsonStore } from './store/JsonStore';
import { DbStore } from './store/DbStore';
import type { ContentMode } from './store/types';

const prisma = new PrismaClient();
const jsonStore = new JsonStore();
const dbStore = new DbStore(prisma);

export function getContentRepository(): ContentRepository {
  const mode = (process.env.CONTENT_MODE as ContentMode) || 'json';
  return new ContentRepository(mode, dbStore, jsonStore, console);
}

export default getContentRepository;
