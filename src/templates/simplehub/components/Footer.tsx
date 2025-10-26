export default function FooterSimplehub() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Simplehub. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}