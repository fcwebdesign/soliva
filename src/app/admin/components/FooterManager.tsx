"use client";
import React from 'react';
import { useFooterManager, FooterData } from './hooks/useFooterManager';
import IdentitySection from './sections/IdentitySection';
import NavigationSection from './sections/NavigationSection';
import SocialSection from './sections/SocialSection';
import LegalSection from './sections/LegalSection';

interface FooterManagerProps {
  content: any;
  onSave: (data: any) => void;
}

const FooterManager = ({ content, onSave }: FooterManagerProps): React.JSX.Element => {
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

  return (
      <div className="space-y-6">
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
    </div>
  );
};

export default FooterManager; 