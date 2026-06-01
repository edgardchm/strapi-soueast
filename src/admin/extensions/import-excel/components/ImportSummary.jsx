import React from 'react';
import styled from 'styled-components';

const SummaryContainer = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #32324d;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  padding: 16px;
  background: ${(props) => props.background || '#f7f8fb'};
  border-left: 4px solid ${(props) => props.borderColor || '#dcdce4'};
  border-radius: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666687;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${(props) => props.color || '#32324d'};
`;

const ImportSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <SummaryContainer>
      <Title>Resumen de validación</Title>
      <GridContainer>
        <StatCard background="#f0f0ff" borderColor="#4945ff">
          <StatLabel>Total de filas</StatLabel>
          <StatValue color="#4945ff">{summary.totalRows}</StatValue>
        </StatCard>
        <StatCard background="#d3fcce" borderColor="#13a538">
          <StatLabel>Filas válidas</StatLabel>
          <StatValue color="#0a6e1e">{summary.validRows}</StatValue>
        </StatCard>
        <StatCard background="#fce4e4" borderColor="#c93c3c">
          <StatLabel>Filas inválidas</StatLabel>
          <StatValue color="#8a3a34">{summary.invalidRows}</StatValue>
        </StatCard>
        {summary.duplicateRows !== undefined && (
          <StatCard background="#fff6e5" borderColor="#ffa500">
            <StatLabel>Duplicadas</StatLabel>
            <StatValue color="#6f3a00">{summary.duplicateRows}</StatValue>
          </StatCard>
        )}
        {summary.modelsDetected !== undefined && (
          <StatCard background="#e7f3ff" borderColor="#0066cc">
            <StatLabel>Modelos detectados</StatLabel>
            <StatValue color="#003d99">{summary.modelsDetected}</StatValue>
          </StatCard>
        )}
        {summary.modelsFound !== undefined && (
          <StatCard background="#e7f3ff" borderColor="#0066cc">
            <StatLabel>Modelos encontrados</StatLabel>
            <StatValue color="#003d99">{summary.modelsFound}</StatValue>
          </StatCard>
        )}
      </GridContainer>
    </SummaryContainer>
  );
};

export default ImportSummary;
