import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import ImportSummary from '../components/ImportSummary';
import ImportRowsTable from '../components/ImportRowsTable';
import ImportErrorsTable from '../components/ImportErrorsTable';

const PageContainer = styled.div`
  padding: 32px;
  background: #f7f8fb;
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 600;
  color: #32324d;
`;

const Subtitle = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666687;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #32324d;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  font-size: 14px;
  color: #32324d;
  background: white;
  cursor: pointer;

  &:hover {
    border-color: #c0bfe0;
  }

  &:focus {
    outline: none;
    border-color: #4945ff;
    box-shadow: 0 0 0 3px rgba(73, 69, 255, 0.12);
  }

  &:disabled {
    background: #f7f8fb;
    color: #a5a5ba;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  font-size: 14px;
  color: #32324d;

  &:hover {
    border-color: #c0bfe0;
  }

  &:focus {
    outline: none;
    border-color: #4945ff;
    box-shadow: 0 0 0 3px rgba(73, 69, 255, 0.12);
  }

  &:disabled {
    background: #f7f8fb;
    color: #a5a5ba;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.primary
      ? `
    background: #4945ff;
    color: white;

    &:hover:not(:disabled) {
      background: #3732cc;
      transform: translateY(-2px);
      box-shadow: 0 2px 6px rgba(73, 69, 255, 0.2);
    }

    &:disabled {
      background: #d0cff7;
      cursor: not-allowed;
    }
  `
      : `
    background: white;
    color: #32324d;
    border: 1px solid #dcdce4;

    &:hover:not(:disabled) {
      border-color: #4945ff;
      color: #4945ff;
    }

    &:disabled {
      background: #f7f8fb;
      color: #a5a5ba;
      border-color: #dcdce4;
      cursor: not-allowed;
    }
  `}
`;

const Alert = styled.div`
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;

  ${(props) =>
    props.type === 'success'
      ? `
    background: #d3fcce;
    color: #0a6e1e;
    border-left: 4px solid #13a538;
  `
      : props.type === 'error'
      ? `
    background: #fce4e4;
    color: #8a3a34;
    border-left: 4px solid #c93c3c;
  `
      : props.type === 'warning'
      ? `
    background: #fff6e5;
    color: #6f3a00;
    border-left: 4px solid #ffa500;
  `
      : `
    background: #e7f3ff;
    color: #003d99;
    border-left: 4px solid #0066cc;
  `}
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 2px dashed #dcdce4;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f7f8fb;

  &:hover {
    border-color: #4945ff;
    background: #f0f0ff;
  }

  &.has-file {
    border-color: #13a538;
    background: #d3fcce;
    color: #0a6e1e;
  }
`;

const FileName = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #32324d;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid #d0cff7;
  border-top-color: #4945ff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 4px;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #32324d;
`;

const ModalText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666687;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const importConfigs = {
  sucursales: {
    label: 'Sucursales',
    previewUrl: '/api/sucursal-import/preview',
    confirmUrl: '/api/sucursal-import/confirm',
  },
  modeloPrecioDesde: {
    label: 'Modelos - Precio desde',
    previewUrl: '/api/modelo-import/preview',
    confirmUrl: '/api/modelo-import/confirm-precio-desde',
  },
  modeloVersiones: {
    label: 'Versiones de modelos',
    previewUrl: '/api/modelo-version-import/preview',
    confirmUrl: '/api/modelo-version-import/confirm',
  },
};

export const ImportExcelPage = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importToken, setImportToken] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setError('El archivo debe ser .xlsx o .xls');
      return;
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede exceder 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setPreviewResult(null);
    setConfirmResult(null);
  };

  const handlePreview = async () => {
    if (!selectedType || !selectedFile) {
      setError('Debes seleccionar tipo de importación y archivo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = importConfigs[selectedType];
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(config.previewUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Error ${response.status}: ${data.error}`);
      }

      setPreviewResult(data);
      setImportToken('');
    } catch (err) {
      setError(`Error en preview: ${err.message}`);
      setPreviewResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = () => {
    if (!importToken) {
      setError('Debes ingresar el token de importación');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmConfirm = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);

    try {
      const config = importConfigs[selectedType];
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(config.confirmUrl, {
        method: 'POST',
        headers: {
          'X-Import-Token': importToken,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 403) {
        throw new Error('Token de importación inválido o expirado');
      }

      if (!response.ok) {
        throw new Error(data.error?.message || `Error ${response.status}: ${data.error}`);
      }

      setConfirmResult(data);
      setImportToken('');
    } catch (err) {
      setError(`Error al confirmar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isPreviewValid = previewResult?.ok && previewResult?.summary?.validRows > 0;
  const canConfirm = isPreviewValid && !confirmResult;
  const hasInvalidRows = previewResult?.summary?.invalidRows > 0;

  return (
    <PageContainer>
      <Card>
        <Title>Importar Excel</Title>
        <Subtitle>Carga archivos Excel para actualizar datos en Strapi</Subtitle>

        {error && <Alert type="error">{error}</Alert>}

        <FormGroup>
          <Label htmlFor="import-type">Tipo de importación *</Label>
          <Select
            id="import-type"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPreviewResult(null);
              setConfirmResult(null);
              setError(null);
            }}
            disabled={loading}
          >
            <option value="">Selecciona un tipo...</option>
            {Object.entries(importConfigs).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="file-input">Archivo Excel (.xlsx, .xls) *</Label>
          <FileInputWrapper>
            <FileInput
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
            <FileLabel htmlFor="file-input" className={selectedFile ? 'has-file' : ''}>
              {selectedFile ? (
                <>
                  <FileName>✓ {selectedFile.name}</FileName>
                </>
              ) : (
                <>
                  <FileName>Haz clic o arrastra un archivo aquí</FileName>
                  <div style={{ fontSize: '12px', color: '#666687', marginTop: '4px' }}>
                    Máximo 5MB
                  </div>
                </>
              )}
            </FileLabel>
          </FileInputWrapper>
        </FormGroup>

        <ButtonGroup>
          <Button
            primary
            onClick={handlePreview}
            disabled={!selectedType || !selectedFile || loading}
          >
            {loading && <Spinner style={{ display: 'inline-block', marginRight: '8px' }} />}
            Previsualizar
          </Button>
        </ButtonGroup>
      </Card>

      {previewResult && (
        <>
          {hasInvalidRows && (
            <Alert type="warning">
              ⚠️ Hay {previewResult.summary.invalidRows} fila(s) inválida(s) que no se importarán
            </Alert>
          )}

          <ImportSummary summary={previewResult.summary} />

          {previewResult.rows && previewResult.rows.length > 0 && (
            <Card>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                Filas a importar ({previewResult.summary.validRows})
              </h3>
              <ImportRowsTable rows={previewResult.rows} />
            </Card>
          )}

          {previewResult.errors && previewResult.errors.length > 0 && (
            <Card>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#c93c3c' }}>
                Errores ({previewResult.errors.length})
              </h3>
              <ImportErrorsTable errors={previewResult.errors} />
            </Card>
          )}

          {isPreviewValid && (
            <Card>
              <FormGroup>
                <Label htmlFor="import-token">Token de importación *</Label>
                <Input
                  id="import-token"
                  type="password"
                  placeholder="Ingresa el token para confirmar la importación"
                  value={importToken}
                  onChange={(e) => {
                    setImportToken(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  primary
                  onClick={handleConfirmClick}
                  disabled={!importToken || loading}
                >
                  {loading && <Spinner style={{ display: 'inline-block', marginRight: '8px' }} />}
                  Confirmar importación
                </Button>
              </ButtonGroup>
            </Card>
          )}

          {confirmResult && (
            <>
              {confirmResult.ok ? (
                <Alert type="success">
                  ✓ Importación completada exitosamente
                </Alert>
              ) : (
                <Alert type="error">
                  ✗ {confirmResult.error}
                </Alert>
              )}

              <Card>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  Resultado final
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '12px', background: '#f7f8fb', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#666687', marginBottom: '4px' }}>Creados</div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#13a538' }}>
                      {confirmResult.summary?.created || 0}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f7f8fb', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#666687', marginBottom: '4px' }}>Actualizados</div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#4945ff' }}>
                      {confirmResult.summary?.updated || 0}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f7f8fb', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#666687', marginBottom: '4px' }}>Errores</div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#c93c3c' }}>
                      {confirmResult.summary?.errors || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {showConfirmModal && (
        <Modal onClick={() => !loading && setShowConfirmModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Confirmar importación</ModalTitle>
            <ModalText>
              Esta acción modificará datos en Strapi. {previewResult.summary.validRows} fila(s) serán procesada(s).
              ¿Deseas continuar?
            </ModalText>
            <ModalButtons>
              <Button onClick={() => setShowConfirmModal(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button primary onClick={handleConfirmConfirm} disabled={loading}>
                {loading && <Spinner style={{ display: 'inline-block', marginRight: '8px' }} />}
                Confirmar
              </Button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};
