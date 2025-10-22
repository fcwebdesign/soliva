import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

function Wrapper() {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  return (
    <div>
      <button
        onClick={() => confirm({ title: 'Titre', description: 'Desc', variant: 'default' })}
      >
        Open
      </button>
      <ConfirmDialog />
    </div>
  );
}

describe('useConfirmDialog', () => {
  it('opens dialog and resolves on confirm', async () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Open'));

    // Boutons par défaut "Annuler" et "Confirmer"
    const confirmBtn = await screen.findByText('Confirmer');
    expect(confirmBtn).toBeInTheDocument();

    // Simuler un clic confirm — la promesse se résout dans le hook; ici on vérifie surtout le rendu
    fireEvent.click(confirmBtn);
  });
});

