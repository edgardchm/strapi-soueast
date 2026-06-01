import React, { useState } from 'react';
import styled from 'styled-components';
import ImportSummary from './components/ImportSummary';
import ImportRowsTable from './components/ImportRowsTable';
import ImportErrorsTable from './components/ImportErrorsTable';

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
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4945ff;
    box-shadow: 0 0 0 3px rgba(73, 69, 255, 0.12);
  }

  &:disabled {
    background-color: #f7f8fb;
    color: #8a8a9e;
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

  &:focus {
    outline: none;
    border-color: #4945ff;
    box-shadow: 0 0 0 3px rgba(73, 69, 255, 0.12);
  }

  &:disabled {
    background-color: #f7f8fb;
    color: #8a8a9e;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background-color: ${(props) => (props.primary ? '#4945ff' : 'white')};
  color: ${(props) => (props.primary ? 'white' : '#32324d')};
  border: 1px solid ${(props) => (props.primary ? '#4945ff' : '#dcdce4')};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.primary ? '#3d39d6' : '#f7f8fb')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Alert = styled.div`
  padding: 16px 12px;
  border-radius: 4px;
  margin-bottom: 24px;
  background-color: ${(props) => (props.error ? '#fce4e4' : '#d3fcce')};
  color: ${(props) => (props.error ? '#8a3a34' : '#0a6e1e')};
  border-left: 4px solid ${(props) => (props.error ? '#c93c3c' : '#13a538')};
`;

const FileInputContainer = styled.div`
  margin-bottom: 20px;
`;

const FileLabel = styled.label`
  display: inline-block;
  padding: 10px 16px;
  background-color: #4945ff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  input[type='file'] {
    display: none;
  }

  &:hover {
    background-color: #3d39d6;
  }
`;

const FileNameDisplay = styled.span`
  margin-left: 12px;
  color: #32324d;
  font-size: 14px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 4px;
  padding: 32px;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #32324d;
`;

const ModalText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666687;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Spinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ImportExcelPage = () => {
  const [selectedType, setSelectedType] = useState('sucursales');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importToken, setImportToken] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const importTypes = {
    sucursales: {
      label: 'Sucursales',
      preview: '/api/sucursal-import/preview',
      confirm: '/api/sucursal-import/confirm',
    },
    modeloPrecioDesde: {
      label: 'Modelos - Precio desde',
      preview: '/api/modelo-import/preview',
      confirm: '/api/modelo-import/confirm-precio-desde',
    },
    modeloVersiones: {
      label: 'Versiones de modelos',
      preview: '/api/modelo-version-import/preview',
      confirm: '/api/modelo-version-import/confirm',
    },
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setPreviewResult(null);
      setConfirmResult(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile || !selectedType) {
      setError('Debes seleccionar un tipo y un archivo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(importTypes[selectedType].preview, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la previsualización');
      }

      const data = await response.json();
      setPreviewResult(data);
    } catch (err) {
      setError(err.message || 'Error al cargar la previsualización');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmConfirm = async () => {
    if (!importToken) {
      setError('Debes ingresar el token de seguridad');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(importTypes[selectedType].confirm, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Import-Token': importToken,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la confirmación');
      }

      const data = await response.json();
      setConfirmResult(data);
      setShowConfirmModal(false);
      setPreviewResult(null);
      setSelectedFile(null);
      setImportToken('');
    } catch (err) {
      setError(err.message || 'Error al confirmar la importación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <Title>Importar Excel</Title>
        <Subtitle>Sube un archivo Excel para importar datos a Strapi</Subtitle>

        {error && <Alert error>{error}</Alert>}
        {confirmResult && !previewResult && (
          <Alert>
            ¡Importación completada exitosamente! {confirmResult.summary?.created || 0} registros creados,{' '}
            {confirmResult.summary?.updated || 0} actualizados.
          </Alert>
        )}

        {!previewResult && !confirmResult && (
          <>
            <FormGroup>
              <Label htmlFor="type">Tipo de importación</Label>
              <Select id="type" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} disabled={loading}>
                {Object.entries(importTypes).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="file">Archivo Excel</Label>
              <FileInputContainer>
                <FileLabel htmlFor="file">Seleccionar archivo</FileLabel>
                <input id="file" type="file" onChange={handleFileSelect} accept=".xlsx,.xls" disabled={loading} />
                {selectedFile && <FileNameDisplay>{selectedFile.name}</FileNameDisplay>}
              </FileInputContainer>
            </FormGroup>

            <Button
              primary
              onClick={handlePreview}
              disabled={!selectedFile || !selectedType || loading}
              style={{ marginRight: '12px' }}
            >
              {loading && <Spinner style={{ display: 'inline-block', marginRight: '8px' }} />}
              Previsualizar
            </Button>
          </>
        )}

        {previewResult && (
          <>
            <ImportSummary summary={previewResult.summary} />
            <ImportRowsTable rows={previewResult.validRows || []} />
            {previewResult.invalidRows && previewResult.invalidRows.length > 0 && (
              <>
                <Card style={{ marginTop: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0' }}>Errores encontrados</h3>
                </Card>
                <ImportErrorsTable errors={previewResult.invalidRows} />
              </>
            )}

            <FormGroup style={{ marginTop: '24px' }}>
              <Label htmlFor="token">Token de seguridad</Label>
              <Input
                id="token"
                type="password"
                value={importToken}
                onChange={(e) => setImportToken(e.target.value)}
                placeholder="Ingresa el token para confirmar"
                disabled={loading}
              />
            </FormGroup>

            <div>
              <Button
                onClick={() => {
                  setPreviewResult(null);
                  setSelectedFile(null);
                  setError(null);
                }}
                disabled={loading}
                style={{ marginRight: '12px' }}
              >
                Cancelar
              </Button>
              <Button
                primary
                onClick={() => setShowConfirmModal(true)}
                disabled={!importToken || loading}
              >
                {loading && <Spinner style={{ display: 'inline-block', marginRight: '8px' }} />}
                Confirmar importación
              </Button>
            </div>
          </>
        )}

        {confirmResult && previewResult && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#d3fcce', borderLeft: '4px solid #13a538', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: '#666687', marginBottom: '4px' }}>Creados</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#0a6e1e' }}>
                  {confirmResult.summary?.created || 0}
                </div>
              </div>
              <div style={{ padding: '16px', background: '#e7f3ff', borderLeft: '4px solid #0066cc', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: '#666687', marginBottom: '4px' }}>Actualizados</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#003d99' }}>
                  {confirmResult.summary?.updated || 0}
                </div>
              </div>
              <div style={{ padding: '16px', background: '#fce4e4', borderLeft: '4px solid #c93c3c', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: '#666687', marginBottom: '4px' }}>Errores</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#c93c3c' }}>
                  {confirmResult.summary?.errors || 0}
                </div>
              </div>
            </div>

            <Button
              primary
              onClick={() => {
                setConfirmResult(null);
                setPreviewResult(null);
                setSelectedFile(null);
                setImportToken('');
                setError(null);
              }}
              style={{ marginTop: '24px' }}
            >
              Nueva importación
            </Button>
          </>
        )}
      </Card>

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

export default ImportExcelPage;
