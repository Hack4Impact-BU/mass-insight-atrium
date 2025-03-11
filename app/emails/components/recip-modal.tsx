import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg relative w-1/3">
        <button onClick={onClose} className="absolute top-3 right-3 text-[#929292] text-xs">Close</button>
            {children}
        </div>
    </div>
  );
};

export default Modal;