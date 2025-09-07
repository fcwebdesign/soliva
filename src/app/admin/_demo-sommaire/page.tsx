"use client";
import React from 'react';
import SommairePanel from '@/components/admin/SommairePanel';
import MobileSommaireButton from '@/components/admin/MobileSommaireButton';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoSommairePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'admin
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Démonstration - Sommaire</h1>
              <p className="text-sm text-gray-600">Interface du panneau de navigation des sections</p>
            </div>
          </div>
          
          {/* Bouton mobile */}
          <MobileSommaireButton />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Zone de contenu simulée */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Zone d'édition simulée</h2>
              <p className="text-gray-600 mb-4">
                Cette zone représente l'éditeur de blocs principal. Sur desktop, le sommaire apparaît 
                dans la colonne de droite pour faciliter la navigation entre les sections.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Section Hero</h3>
                  <p className="text-sm text-gray-600">Titre principal avec call-to-action</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Section Services</h3>
                  <p className="text-sm text-gray-600">Présentation des services</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Section Témoignages</h3>
                  <p className="text-sm text-gray-600">Avis clients</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Section Contact</h3>
                  <p className="text-sm text-gray-600">Formulaire de contact</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">💡 Instructions de test</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Desktop :</strong> Le sommaire est visible dans la colonne de droite</li>
                <li>• <strong>Mobile :</strong> Cliquez sur le bouton "Plan" pour ouvrir le sommaire</li>
                <li>• <strong>Recherche :</strong> Testez la recherche de sections</li>
                <li>• <strong>Filtres :</strong> Filtrez par type de section</li>
                <li>• <strong>Actions :</strong> Survolez les sections pour voir les actions</li>
                <li>• <strong>États :</strong> Observez les différents statuts (OK, À compléter, Masquée, Verrouillée)</li>
                <li>• <strong>Tabs :</strong> Testez l'onglet "SEO & publication"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Panneau sommaire - visible uniquement sur desktop */}
        <div className="hidden lg:block">
          <SommairePanel />
        </div>
      </div>
    </div>
  );
}
