import { AboutBlock } from '../types';

export default function About({ title, content }: AboutBlock) {
  return (
    <section className="py-[var(--section)] border-t border-black/5">
      <div className="container grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-4">
          <h2 className="title text-2xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <div className="md:col-span-8 text-black/70 leading-relaxed max-w-[68ch]">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </section>
  );
} 