import React from 'react';

interface H3Data {
  content: string;
}

export default function H3Block({ data }: { data: H3Data }) {
  return <h3 className="text-xl font-semibold text-gray-900 mb-4">{data.content}</h3>;
}
