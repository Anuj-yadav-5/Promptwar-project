import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative glass-panel neon-border p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  /** Whether the modal is visible */
  isOpen: PropTypes.bool.isRequired,
  /** Callback fired when the modal should close */
  onClose: PropTypes.func.isRequired,
  /** Title shown in the modal header */
  title: PropTypes.string.isRequired,
  /** Modal body content */
  children: PropTypes.node,
};

