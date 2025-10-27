"use client";
import React from 'react';
import { useFooterManager, FooterData } from './hooks/useFooterManager';
import IdentitySection from './sections/IdentitySection';
import NavigationSection from './sections/NavigationSection';
import SocialSection from './sections/SocialSection';
import LegalSection from './sections/LegalSection';
import FooterVariantsSection from './sections/FooterVariantsSection';

interface FooterManagerProps {
  content: any;
  onSave: (data: any) => void;
  onUpdate?: (updates: any) => void;
}

const FooterManager = ({ content, onSave, onUpdate }: FooterManagerProps): React.JSX.Element => {
  const {
    // State
    footerData,
    setFooterData,
    logoType,
    setLogoType,
    editingLink,
    setEditingLink,
    editingLegalPage,
    setEditingLegalPage,
    searchTerm,
    setSearchTerm,
    legalSearchTerm,
    setLegalSearchTerm,
    availableSocials,
    draggedItem,
    dragOverIndex,
    
    // Data
    availablePages,
    availableLegalPages,
    filteredPages,
    filteredLegalPages,
    
    // Link functions
    toggleLink,
    addCustomLink,
    updateLinkUrl,
    updateLinkTarget,
    moveLink,
    updateLinkTitle,
    
    // Social functions
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    
    // Legal functions
    addBottomLink,
    addCustomLegalLink,
    updateBottomLink,
    removeBottomLink,
    toggleLegalPage,
    moveBottomLink,
    getLegalPageLabel,
    getLegalPageUrl,
    getLegalPageTarget,
    updateLegalPageLabel,
    updateLegalPageUrl,
    updateLegalPageTarget,
    
    // Drag & Drop
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useFooterManager(content);

  const handleSave = async () => {
    const newContent = {
      ...content,
      footer: {
        logo: footerData.logo,
        logoImage: footerData.logoImage,
        description: footerData.description,
        footerVariant: footerData.variant || content?.footer?.footerVariant || 'classic',
        links: footerData.links,
        socialLinks: footerData.socialLinks,
        copyright: footerData.copyright,
        bottomLinks: footerData.bottomLinks,
        legalPageLabels: footerData.legalPageLabels
      }
    };
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (!res.ok) throw new Error('save');
      onSave?.(newContent);
      window.dispatchEvent(new CustomEvent('footer-changed'));
    } catch (e) {
      console.error('Erreur sauvegarde footer:', e);
    }
  };

  // Note: on déclenche déjà un événement 'footer-changed' dans le hook pour activer la barre globale;
  // on évite ici d'appeler onUpdate en boucle pour ne pas créer de cycles d'updates.

  return (
      <div className="space-y-6">
      <FooterVariantsSection
        localData={content}
        updateField={(path, value) => {
          // path always footer.footerVariant here but keep it generic
          setFooterData(prev => ({ ...prev, // mirror locally for live preview
            ...(path === 'footer.footerVariant' ? { variant: value } : {}),
          }));
          window.dispatchEvent(new CustomEvent('footer-changed'));
        }}
      />
      <IdentitySection
        footerData={footerData}
        logoType={logoType}
        onLogoTypeChange={setLogoType}
        onLogoChange={(value) => {
          setFooterData(prev => ({ ...prev, logo: value }));
                  window.dispatchEvent(new CustomEvent('footer-changed'));
                }}
        onLogoImageChange={(url) => {
                    setFooterData(prev => ({ ...prev, logoImage: url }));
                    window.dispatchEvent(new CustomEvent('footer-changed'));
                  }}
        onDescriptionChange={(value) => {
          setFooterData(prev => ({ ...prev, description: value }));
                  window.dispatchEvent(new CustomEvent('footer-changed'));
                }}
      />

      <NavigationSection
        footerData={footerData}
        availablePages={availablePages}
        filteredPages={filteredPages}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onToggleLink={toggleLink}
        onAddCustomLink={addCustomLink}
        onUpdateLinkTitle={updateLinkTitle}
        onUpdateLinkUrl={updateLinkUrl}
        onUpdateLinkTarget={updateLinkTarget}
        onMoveLink={moveLink}
        onRemoveLink={(url) => toggleLink(url)}
        editingLink={editingLink}
        onSetEditingLink={setEditingLink}
        draggedItem={draggedItem}
        dragOverIndex={dragOverIndex}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
      />

      <SocialSection
        footerData={footerData}
        availableSocials={availableSocials}
        onAddSocialLink={addSocialLink}
        onUpdateSocialLink={updateSocialLink}
        onRemoveSocialLink={removeSocialLink}
      />

      <LegalSection
        footerData={footerData}
        availableLegalPages={availableLegalPages}
        filteredLegalPages={filteredLegalPages}
        legalSearchTerm={legalSearchTerm}
        onLegalSearchChange={setLegalSearchTerm}
        onCopyrightChange={(value) => {
          setFooterData(prev => ({ ...prev, copyright: value }));
                    window.dispatchEvent(new CustomEvent('footer-changed'));
                  }}
        onToggleLegalPage={toggleLegalPage}
        onAddCustomLegalLink={addCustomLegalLink}
        onMoveBottomLink={moveBottomLink}
        onRemoveBottomLink={removeBottomLink}
        onUpdateLegalPageLabel={updateLegalPageLabel}
        onUpdateLegalPageUrl={updateLegalPageUrl}
        onUpdateLegalPageTarget={updateLegalPageTarget}
        onGetLegalPageLabel={getLegalPageLabel}
        onGetLegalPageUrl={getLegalPageUrl}
        onGetLegalPageTarget={getLegalPageTarget}
        editingLegalPage={editingLegalPage}
        onSetEditingLegalPage={setEditingLegalPage}
        draggedItem={draggedItem}
        dragOverIndex={dragOverIndex}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
      />

      {/* Bouton de sauvegarde retiré: la barre en haut gère la sauvegarde */}
    </div>
  );
};

export default FooterManager; 
