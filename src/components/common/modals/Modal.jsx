import React from "react";

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md ${className}`}
      >
        {title && (
          <div className="text-xl font-semibold mb-4 border-b pb-2">
            {title}
          </div>
        )}
        <div>{children}</div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;




// ---------- ✅ Example usage: ----------`

{
  /* 
    import React, { useState } from 'react';
import Modal from './Modal';

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                Open Modal
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="My Modal Title"
            >
                <p>This is modal content.</p>
            </Modal>
        </>
    );
};

    */
}
