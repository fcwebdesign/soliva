"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { defaultSpacing } from '@/utils/spacing';

interface SpacingSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

type SizeKey = 'sm' | 'md' | 'lg' | 'xl';

const SpacingSection: React.FC<SpacingSectionProps> = ({ localData, updateField }) => {
  const [mode, setMode] = useState<'auto'|'custom'>('custom');
  const [autoTarget, setAutoTarget] = useState<number>(120);
  const [sectionY, setSectionY] = useState<string>(defaultSpacing.sectionY || '7rem');
  const [gapSm, setGapSm] = useState<string>(defaultSpacing.gap?.sm || '0.5rem');
  const [gapMd, setGapMd] = useState<string>(defaultSpacing.gap?.md || '1rem');
  const [gapLg, setGapLg] = useState<string>(defaultSpacing.gap?.lg || '1.5rem');
  const [gapXl, setGapXl] = useState<string>('4rem');
  const [defaultGap, setDefaultGap] = useState<SizeKey>(defaultSpacing.defaultGap || 'md');

  // Constructeur clamp (min / fluide / max) pour le mode "custom"
  const [clampMin, setClampMin] = useState<string>('72px');
  const [clampFluid, setClampFluid] = useState<string>('10vw');
  const [clampMax, setClampMax] = useState<string>('140px');

  const parseClamp = (value?: string) => {
    if (!value) return null;
    const m = value.match(/clamp\(\s*([^,]+),\s*([^,]+),\s*([^\)]+)\s*\)/i);
    if (!m) return null;
    return { min: m[1].trim(), fluid: m[2].trim(), max: m[3].trim() } as const;
  };

  // Charger valeurs existantes
  useEffect(() => {
    const spacing = localData?.metadata?.spacing || {};
    if (spacing.mode) setMode(spacing.mode);
    if (typeof spacing.autoTarget === 'number') setAutoTarget(spacing.autoTarget);
    if (spacing.sectionY) {
      setSectionY(spacing.sectionY);
      const parsed = parseClamp(spacing.sectionY);
      if (parsed) {
        setClampMin(parsed.min);
        setClampFluid(parsed.fluid);
        setClampMax(parsed.max);
      }
    }
    if (spacing.gap?.sm) setGapSm(spacing.gap.sm);
    if (spacing.gap?.md) setGapMd(spacing.gap.md);
    if (spacing.gap?.lg) setGapLg(spacing.gap.lg);
    if (spacing.gap?.xl) setGapXl(spacing.gap.xl);
    if (spacing.defaultGap) setDefaultGap(spacing.defaultGap);
  }, [localData?.metadata?.spacing]);

  const save = (updates?: Partial<{ sectionY: string; gapSm: string; gapMd: string; gapLg: string; gapXl: string; defaultGap: SizeKey; mode: 'auto'|'custom'; autoTarget: number }>) => {
    const nextMode = updates?.mode ?? mode;
    const next: any = {
      mode: nextMode,
      gap: {
        sm: updates?.gapSm ?? gapSm,
        md: updates?.gapMd ?? gapMd,
        lg: updates?.gapLg ?? gapLg,
        xl: updates?.gapXl ?? gapXl,
      },
      defaultGap: updates?.defaultGap ?? defaultGap,
    };
    if (nextMode === 'auto') {
      next.autoTarget = updates?.autoTarget ?? autoTarget;
    } else {
      next.sectionY = updates?.sectionY ?? sectionY;
    }
    updateField('metadata.spacing', next);
  };

  // Aperçu pour le mode auto (basé sur metadata.layout)
  const layoutName = (localData?.metadata?.layout as string) || 'standard';
  const layoutWidth = layoutName === 'compact' ? 1280 : layoutName === 'wide' ? 1920 : 1536;
  const autoPreview = useMemo(() => {
    const target = Number(autoTarget) || 0;
    if (!target) return '';
    const vw = (target / layoutWidth) * 100;
    const minPx = Math.round(target * 0.6);
    const maxPx = Math.round(target * 1.4);
    return `clamp(${minPx}px, ${vw.toFixed(2)}vw, ${maxPx}px)`;
  }, [autoTarget, layoutWidth]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">Espacement global</h2>
        <p className="text-sm text-gray-600">Définit les variables CSS utilisées par les sections et grilles pour un rythme vertical/horizontal cohérent.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="spacing-mode" checked={mode === 'auto'} onChange={() => { setMode('auto'); save({ mode: 'auto' }); }} />
              <span>Simple (auto, basé sur le layout)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="spacing-mode" checked={mode === 'custom'} onChange={() => { setMode('custom'); save({ mode: 'custom' }); }} />
              <span>Avancé (valeur personnalisée)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">Auto s'aligne sur Métadonnées → Layout du site ({layoutName}, {layoutWidth}px).</p>
        </div>

        <div>
          {mode === 'custom' ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espacement vertical de section</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="ex: clamp(72px, 10vw, 140px) ou 7rem"
                value={sectionY}
                onChange={(e) => setSectionY(e.target.value)}
                onBlur={(e) => save({ sectionY: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Utilisé par <code>py-[var(--section)]</code>.</p>

              {/* Constructeur clamp */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Constructeur clamp (min / fluide / max)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input className="w-full border rounded-md px-3 py-2" placeholder="min (ex: 72px)" value={clampMin}
                         onChange={(e) => setClampMin(e.target.value)}
                         onBlur={(e) => { const next = `clamp(${e.target.value || '72px'}, ${clampFluid}, ${clampMax})`; setSectionY(next); save({ sectionY: next }); }} />
                  <input className="w-full border rounded-md px-3 py-2" placeholder="fluide (ex: 10vw)" value={clampFluid}
                         onChange={(e) => setClampFluid(e.target.value)}
                         onBlur={(e) => { const next = `clamp(${clampMin}, ${e.target.value || '10vw'}, ${clampMax})`; setSectionY(next); save({ sectionY: next }); }} />
                  <input className="w-full border rounded-md px-3 py-2" placeholder="max (ex: 140px)" value={clampMax}
                         onChange={(e) => setClampMax(e.target.value)}
                         onBlur={(e) => { const next = `clamp(${clampMin}, ${clampFluid}, ${e.target.value || '140px'})`; setSectionY(next); save({ sectionY: next }); }} />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => {
                    const v = 'clamp(72px, 10vw, 140px)'; setClampMin('72px'); setClampFluid('10vw'); setClampMax('140px'); setSectionY(v); save({ sectionY: v });
                  }}>Utiliser un clamp recommandé (clamp(72px, 10vw, 140px))</button>
                  <span className="text-xs text-gray-500">Aperçu: {`clamp(${clampMin || '72px'}, ${clampFluid || '10vw'}, ${clampMax || '140px'})`}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cible desktop (px)</label>
              <input type="number" className="w-full border rounded-md px-3 py-2" placeholder="ex: 120" value={autoTarget}
                     onChange={(e) => setAutoTarget(Number(e.target.value) || 0)}
                     onBlur={(e) => save({ autoTarget: Number(e.target.value) || 0, mode: 'auto' })} />
              <p className="text-xs text-gray-500 mt-1">Aperçu auto: {autoPreview || '—'}</p>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gap par défaut</label>
        <select className="w-full border rounded-md px-3 py-2" value={defaultGap}
                onChange={(e) => { const val = e.target.value as SizeKey; setDefaultGap(val); save({ defaultGap: val }); }}>
          <option value="sm">Petit (sm)</option>
          <option value="md">Moyen (md)</option>
          <option value="lg">Grand (lg)</option>
          <option value="xl">Très grand (xl)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Valeur exposée comme <code>var(--gap)</code>.</p>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Tailles de gap</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap sm</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 8px ou 0.5rem"
              value={gapSm}
              onChange={(e) => setGapSm(e.target.value)}
              onBlur={(e) => save({ gapSm: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap md</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 16px ou 1rem"
              value={gapMd}
              onChange={(e) => setGapMd(e.target.value)}
              onBlur={(e) => save({ gapMd: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap lg</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 24px ou 1.5rem"
              value={gapLg}
              onChange={(e) => setGapLg(e.target.value)}
              onBlur={(e) => save({ gapLg: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap xl (Très grand)</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="ex: 64px ou 4rem"
              value={gapXl}
              onChange={(e) => setGapXl(e.target.value)}
              onBlur={(e) => save({ gapXl: e.target.value })}
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
