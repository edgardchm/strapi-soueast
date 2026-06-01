import React, { useState } from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  overflow-x: auto;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Thead = styled.thead`
  background: #fce4e4;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #8a3a34;
  border-bottom: 1px solid #dcdce4;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f0f0ff;
  color: #666687;
  max-width: 300px;
  word-break: break-word;

  &:first-child {
    background: #fff6f6;
    font-weight: 500;
    color: #32324d;
  }
`;

const Tr = styled.tr`
  &:hover {
    background: #fff6f6;
  }
`;

const ErrorBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  background: #fce4e4;
  color: #8a3a34;
  text-transform: uppercase;
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-top: 1px solid #dcdce4;
  background: #f7f8fb;
  font-size: 13px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const PaginationButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #dcdce4;
  background: white;
  color: #32324d;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;

  &:hover:not(:disabled) {
    border-color: #c93c3c;
    color: #c93c3c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImportErrorsTable = ({ errors }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!errors || errors.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666687' }}>No hay errores</div>;
  }

  const totalPages = Math.ceil(errors.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentErrors = errors.slice(startIndex, endIndex);

  return (
    <>
      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <Th>Fila</Th>
              <Th>Tipo</Th>
              <Th>Descripción</Th>
            </tr>
          </Thead>
          <tbody>
            {currentErrors.map((error, index) => (
              <Tr key={index}>
                <Td>{error.rowNumber}</Td>
                <Td>
                  <ErrorBadge>Error</ErrorBadge>
                </Td>
                <Td>{error.reason || error.error}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <PaginationContainer>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <PaginationButtons>
            <PaginationButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              Primera
            </PaginationButton>
            <PaginationButton onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Anterior
            </PaginationButton>
            <PaginationButton onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Siguiente
            </PaginationButton>
            <PaginationButton onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              Última
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      )}
    </>
  );
};

export default ImportErrorsTable;
