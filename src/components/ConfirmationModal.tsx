import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-zinc-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-2xl ${isDanger ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-900'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-colors text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-sm shadow-sm ${
              isDanger 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
