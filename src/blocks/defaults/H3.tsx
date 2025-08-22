import { H3Block } from '../types';

export default function H3({ content }: H3Block) {
  return <h3 className="text-xl font-semibold text-gray-900 mb-4">{content}</h3>;
} 