import React from 'react';
import { X } from 'lucide-react';

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div 
        className="bg-white rounded-modal shadow-lg w-full relative z-10 animate-in zoom-in-95 duration-200"
        style={{ maxWidth }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// DataTable
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export const DataTable = ({ columns, data, onRowClick }: DataTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-card border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-text-primary font-medium">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
