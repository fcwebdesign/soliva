import React from "react";

/**
 * BlockThumb – miniatures SVG "wireframe" auto‑générées pour tes blocs CMS.
 *
 * Intégration rapide :
 * 1) Chaque bloc exporte une `meta` (cols, media, hasCta, density...)
 * 2) Tu affiches <BlockThumb meta={block.meta} /> dans ta grille/liste du volet (Sheet shadcn/ui)
 * 3) Clique sur la carte → onPick(block.id)
 */

export type BlockMeta = {
  cols?: 1 | 2 | 3 | 4;
  media?: "none" | "left" | "right" | "top";
  hasCta?: boolean;
  density?: "s" | "m" | "l"; // quantité de lignes de texte symboliques
};

export function BlockThumb({
  meta,
  width = 160,
  height = 104,
  radius = 12,
  ariaLabel,
  className,
}: {
  meta: BlockMeta;
  width?: number;
  height?: number;
  radius?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const m: Required<BlockMeta> = {
    cols: 1,
    media: "none",
    hasCta: false,
    density: "m",
    ...meta,
  } as any;

  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const colW = m.cols > 1 ? w / m.cols : w;
  const mediaW = m.media === "left" || m.media === "right" ? colW * 0.48 : w;
  const mediaH = m.media === "top" ? h * 0.36 : h * 0.68;
  const LINES = m.density === "s" ? 2 : m.density === "l" ? 5 : 3;
  const textBlockX = m.media === "left" ? pad + mediaW + 10 : m.media === "right" ? pad : pad;
  const textBlockW = m.media === "left" || m.media === "right" ? w - mediaW - 10 : w;

  const bg = "fill-neutral-100";
  const ink = "fill-neutral-300";
  const inkStrong = "fill-neutral-400";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? "Miniature de bloc"}
      className={className}
    >
      {/* Carte */}
      <rect x={0} y={0} width={width} height={height} rx={radius} className={bg} />

      {/* Médias */}
      {m.media !== "none" && (
        <>
          {m.media === "left" && (
            <rect x={pad} y={pad} width={mediaW} height={mediaH} rx={8} className={ink} />
          )}
          {m.media === "right" && (
            <rect x={pad + w - mediaW} y={pad} width={mediaW} height={mediaH} rx={8} className={ink} />
          )}
          {m.media === "top" && (
            <rect x={pad} y={pad} width={w} height={mediaH} rx={8} className={ink} />
          )}
        </>
      )}

      {/* Lignes de texte symboliques */}
      {Array.from({ length: LINES }).map((_, i) => {
        const y0 = (m.media === "top" ? pad + mediaH + 10 : pad + 10) + i * 12;
        const len = i === 0 ? textBlockW * 0.8 : i === LINES - 1 ? textBlockW * 0.5 : textBlockW * 0.95;
        return (
          <rect
            key={i}
            x={textBlockX}
            y={y0}
            width={len}
            height={8}
            rx={4}
            className={i === 0 ? inkStrong : ink}
          />
        );
      })}

      {/* CTA */}
      {m.hasCta && (
        <rect
          x={textBlockX}
          y={h - 20}
          width={80}
          height={16}
          rx={8}
          className={inkStrong}
        />
      )}

      {/* 2 colonnes bien marquées + ligne de séparation centrale */}
      {m.cols === 2 && (
        <>
          {(() => {
            const outer = 10;      // marge latérale
            const gap = 12;        // espace au centre (la ligne vit dedans)
            const lineW = 2;       // épaisseur de la ligne
            const colW = (w - outer * 2 - gap) / 2;

            const y = pad + 6;
            const colH = h - 12;

            const xL = pad + outer;
            const xR = xL + colW + gap;

            // ligne au milieu du gap
            const sepX = xL + colW + (gap - lineW) / 2;

            return (
              <g>
                {/* blocs pleins (arrondis) */}
                <rect x={xL} y={y} width={colW} height={colH} rx={10} className="fill-neutral-200" />
                <rect x={xR} y={y} width={colW} height={colH} rx={10} className="fill-neutral-200" />

                {/* séparateur central */}
                <rect x={sepX} y={pad} width={lineW} height={h} rx={1} className="fill-neutral-300" />
              </g>
            );
          })()}
        </>
      )}
    </svg>
  );
}
