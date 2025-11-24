import { ReactNode } from "react";
"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import "../globals.css";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isPreview = pathname?.includes('/admin/preview');

  useEffect(() => {
    // Ajouter la classe admin-page au body (sauf sur la preview pour respecter la palette du template)
    if (!isPreview) {
      document.body.classList.add('admin-page');
    }

    return () => {
      // Nettoyer la classe au démontage
      document.body.classList.remove('admin-page');
    };
  }, [isPreview]);

  return (
    <div className={isPreview ? '' : 'admin-page'}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .nav {
            display: none !important;
          }
          body.admin-page {
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
        `
      }} />
      {children}
    </div>
  );
} 
