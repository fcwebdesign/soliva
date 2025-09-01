import React from 'react';

interface H2Data {
  content: string;
}

export default function H2Block({ data }: { data: H2Data }) {
  return <h2 className="text-3xl font-bold text-gray-900 mb-6">{data.content}</h2>;
}
