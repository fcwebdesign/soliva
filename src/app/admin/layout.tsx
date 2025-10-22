import { ReactNode } from "react";
"use client";
import { useEffect } from 'react';
import "../globals.css";

export default function AdminLayout({ children }) {
  useEffect(() => {
    // Ajouter la classe admin-page au body
    document.body.classList.add('admin-page');
    
    return () => {
      // Nettoyer la classe au démontage
      document.body.classList.remove('admin-page');
    };
  }, []);

  return (
    <div className="admin-page">
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