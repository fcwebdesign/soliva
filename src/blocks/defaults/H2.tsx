import { H2Block } from '../types';

export default function H2({ content }: H2Block) {
  return <h2 className="text-3xl font-bold text-gray-900 mb-6">{content}</h2>;
} 