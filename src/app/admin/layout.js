import "../globals.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-page">
      <style dangerouslySetInnerHTML={{
        __html: `
          .nav {
            display: none !important;
          }
        `
      }} />
      {children}
    </div>
  );
} 