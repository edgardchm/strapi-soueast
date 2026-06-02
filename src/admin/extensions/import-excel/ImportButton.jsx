import React, { useState } from 'react';
import styled from 'styled-components';
import ImportExcelPage from './index.jsx';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 4px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10001;

  &:hover {
    background: #f7f8fb;
  }
`;

const ImportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 16px',
          backgroundColor: '#4945ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '16px',
        }}
      >
        📤 Importar Excel
      </button>

      {isOpen && (
        <ModalOverlay onClick={() => setIsOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ImportExcelPage />
          </ModalContent>
          <CloseButton onClick={() => setIsOpen(false)}>Cerrar ✕</CloseButton>
        </ModalOverlay>
      )}
    </>
  );
};

export default ImportButton;
