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
  background: #f7f8fb;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #32324d;
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
    background: #f7f8fb;
    font-weight: 500;
    color: #32324d;
  }
`;

const Tr = styled.tr`
  &:hover {
    background: #f7f8fb;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  background: #d3fcce;
  color: #0a6e1e;
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
    border-color: #4945ff;
    color: #4945ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImportRowsTable = ({ rows }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!rows || rows.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666687' }}>No hay filas para mostrar</div>;
  }

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = rows.slice(startIndex, endIndex);

  // Extraer columnas dinámicamente de los datos
  const columnsSet = new Set();
  rows.forEach((row) => {
    if (row.data) {
      Object.keys(row.data).forEach((key) => {
        columnsSet.add(key);
      });
    }
  });
  const columns = Array.from(columnsSet).sort();

  return (
    <>
      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <Th>Fila</Th>
              <Th>Estado</Th>
              {columns.map((col) => (
                <Th key={col}>{col}</Th>
              ))}
            </tr>
          </Thead>
          <tbody>
            {currentRows.map((row) => (
              <Tr key={row.rowNumber}>
                <Td>{row.rowNumber}</Td>
                <Td>
                  <Badge>{row.status}</Badge>
                </Td>
                {columns.map((col) => (
                  <Td key={col}>
                    {row.data[col] !== null && row.data[col] !== undefined
                      ? typeof row.data[col] === 'object'
                        ? JSON.stringify(row.data[col])
                        : String(row.data[col])
                      : '-'}
                  </Td>
                ))}
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

export default ImportRowsTable;
