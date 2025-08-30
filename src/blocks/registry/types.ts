import { z } from 'zod';

export type BlockType = string; // ex: 'two-columns'

export interface BlockBase<TData = unknown> {
  id: string;
  type: BlockType;
  data: TData;
}

export type BlockSchema<T> = z.ZodType<T>;

export interface BlockMeta {
  type: BlockType;
  label: string;
  category?: string;
  icon?: React.ComponentType<any> | string; // string = emoji
}

export interface BlockModule<TData = unknown> {
  meta: BlockMeta;
  schema: BlockSchema<TData>;
  defaultData: TData;
  Render: React.ComponentType<{ data: TData }>;
  Editor: React.ComponentType<{
    data: TData;
    onChange: (next: TData) => void;
  }>;
}

export type BlockMap = Record<BlockType, BlockModule<any>>; 