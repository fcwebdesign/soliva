"use client";
import React, { useEffect, useState } from 'react';
import { defaultSpacing } from '@/utils/spacing';

interface SpacingSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

type SizeKey = 'sm' | 'md' | 'lg';

const SpacingSection: React.FC<SpacingSectionProps> = ({ localData, updateField }) => {
  const [sectionY, setSectionY] = useState<string>(defaultSpacing.sectionY || '7rem');
  const [gapSm, setGapSm] = useState<string>(defaultSpacing.gap?.sm || '0.5rem');
  const [gapMd, setGapMd] = useState<string>(defaultSpacing.gap?.md || '1rem');
  const [gapLg, setGapLg] = useState<string>(defaultSpacing.gap?.lg || '1.5rem');
  const [defaultGap, setDefaultGap] = useState<SizeKey>(defaultSpacing.defaultGap || 'md');

  // Charger valeurs existantes
  useEffect(() => {
    const spacing = localData?.metadata?.spacing || {};
    if (spacing.sectionY) setSectionY(spacing.sectionY);
    if (spacing.gap?.sm) setGapSm(spacing.gap.sm);
    if (spacing.gap?.md) setGapMd(spacing.gap.md);
    if (spacing.gap?.lg) setGapLg(spacing.gap.lg);
    if (spacing.defaultGap) setDefaultGap(spacing.defaultGap);
  }, [localData?.metadata?.spacing]);

  const save = (updates?: Partial<{ sectionY: string; gapSm: string; gapMd: string; gapLg: string; defaultGap: SizeKey }>) => {
    const next = {
      sectionY: updates?.sectionY ?? sectionY,
      gap: {
        sm: updates?.gapSm ?? gapSm,
        md: updates?.gapMd ?? gapMd,
        lg: updates?.gapLg ?? gapLg,
      },
      defaultGap: updates?.defaultGap ?? defaultGap,
    };
    updateField('metadata.spacing', next);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">Espacement global</h2>
        <p className="text-sm text-gray-600">Définit les variables CSS utilisées par les sections et grilles pour un rythme vertical/horizontal cohérent.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Espacement vertical de section</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="ex: clamp(72px, 10vw, 140px) ou 7rem"
            value={sectionY}
            onChange={(e) => setSectionY(e.target.value)}
            onBlur={() => save({ sectionY })}
          />
          <p className="text-xs text-gray-500 mt-1">Utilisé par `py-[var(--section)]`.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gap par défaut</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={defaultGap}
            onChange={(e) => { const val = e.target.value as SizeKey; setDefaultGap(val); save({ defaultGap: val }); }}
          >
            <option value="sm">Petit (sm)</option>
            <option value="md">Moyen (md)</option>
            <option value="lg">Grand (lg)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Valeur exposée comme `var(--gap)`.</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Tailles de gap</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap sm</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 8px ou 0.5rem"
              value={gapSm}
              onChange={(e) => setGapSm(e.target.value)}
              onBlur={() => save({ gapSm })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap md</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 16px ou 1rem"
              value={gapMd}
              onChange={(e) => setGapMd(e.target.value)}
              onBlur={() => save({ gapMd })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap lg</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 24px ou 1.5rem"
              value={gapLg}
              onChange={(e) => setGapLg(e.target.value)}
              onBlur={() => save({ gapLg })}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Utilisables via <code>gap-[var(--gap)]</code> ou override local:
          {' '}
          <code>{"style={{ '--gap': 'var(--gap-sm)' }}"}</code>.
        </p>
      </div>
    </div>
  );
};

export default SpacingSection;
