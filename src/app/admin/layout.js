import "../globals.css";

export default function AdminLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .nav {
            display: none !important;
          }
        `
      }} />
      {children}
    </>
  );
} 