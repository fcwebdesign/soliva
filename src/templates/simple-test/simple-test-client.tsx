'use client';

export default function SimpletestClient() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Template Simple Test</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Accueil</a>
              <a href="/work" className="text-gray-500 hover:text-gray-900">Projets</a>
              <a href="/studio" className="text-gray-500 hover:text-gray-900">Studio</a>
              <a href="/blog" className="text-gray-500 hover:text-gray-900">Blog</a>
              <a href="/contact" className="text-gray-500 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Template Simple Test</h2>
          <p className="text-gray-600 mb-8">Template de test avec thème minimal</p>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">Contenu du template à configurer</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 Simple Test. Template généré automatiquement.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}