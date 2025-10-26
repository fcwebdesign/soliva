"use client";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { buildNavModel } from "@/utils/navModel";
import { useTemplate } from "@/templates/context";

export default function HeaderPearl({ nav, pages }: any) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { key } = useTemplate();
  const model = buildNavModel({ nav, pages, pathname, templateKey: key !== 'default' ? key : undefined });

  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center space-x-3">
              {model.brand.image ? (
                <img src={model.brand.image} alt="Logo" className="h-8 w-auto object-contain max-w-[180px]" />
              ) : (
                <span className="text-xl font-bold tracking-tight text-gray-900 truncate">{model.brand.text}</span>
              )}
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            {model.items.map((item: any) => (
              <Link
                key={item.key}
                href={item.href}
                target={item.target}
                className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-3">
            {model.location && <span className="hidden sm:inline text-xs text-gray-400">{model.location}</span>}
            <button type="button" className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-200" onClick={() => setOpen(v => !v)} aria-label="Ouvrir le menu" aria-expanded={open}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}</svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {model.items.map((item: any) => (
              <div key={item.key} className="block">
                <Link
                  href={item.href}
                  target={item.target}
                  className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
