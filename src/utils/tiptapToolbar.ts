import type { Editor } from '@tiptap/react';

export function isMarkActiveAtCursor(editor: Editor, markName: 'bold'|'italic'|'link') {
  const { state } = editor;
  const { empty, from, to, $from } = state.selection;
  const markType = state.schema.marks[markName];
  if (!markType) return false;

  if (empty) {
    // Pas de sélection : on regarde UNIQUEMENT les marks du nœud au curseur (sans storedMarks)
    return !!markType.isInSet($from.marks());
  }
  // Avec sélection : true s'il y a au moins un caractère avec la mark dans l'intervalle
  return state.doc.rangeHasMark(from, to, markType);
} 