export type ColumnStatus = "ok" | "incomplete" | "hidden" | "locked";

export type ColumnType = "icon-title-text" | "image-title-cta" | "stat" | "logo" | "text-only" | "image-only";

export interface Column {
  id: string;
  type: ColumnType;
  label?: string;
  status?: ColumnStatus;
  props: {
    title?: string;
    text?: string;
    image?: string;
    icon?: string;
    ctaText?: string;
    ctaLink?: string;
    statValue?: string;
    statLabel?: string;
    logo?: string;
    [key: string]: unknown;
  };
}

export interface ColumnsRow {
  id: string;
  columns: Column[]; // 2..4
  gutter?: "none" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  responsive?: { 
    stackOrder?: number[]; 
    hideOn?: Array<"mobile" | "tablet"> 
  };
}

export interface ColumnsRowCardProps {
  row: ColumnsRow;
  onChange: (next: ColumnsRow) => void;
  onOpenColumn: (columnId: string) => void;
  onSwap: (a: string, b: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface ColumnDrawerProps {
  column: Column | null;
  columnIndex: number;
  totalColumns: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (column: Column) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasUnsavedChanges: boolean;
}

export interface ColumnListItemProps {
  column: Column;
  index: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onSwap: (direction: 'up' | 'down') => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}
