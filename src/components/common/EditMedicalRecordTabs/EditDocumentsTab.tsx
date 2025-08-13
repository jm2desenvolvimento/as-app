import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalRecord, Document } from '../../../types/medical-record';
import { Plus, Edit2, Trash2, Calendar, FileText, Loader2, Upload, Download, Eye } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface EditDocumentsTabProps {
  formData: Partial<MedicalRecord>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MedicalRecord>>>;
}

const EditDocumentsTab: React.FC<EditDocumentsTabProps> = ({ formData, setFormData }) => {
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    id: '',
    name: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    url: '',
    added_by: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch documents from API
  const fetchDocuments = async () => {
    if (!formData.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/medical-records/${formData.id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setDocuments(response.data);
      // Update formData with fetched documents
      setFormData(prev => ({ ...prev, documents: response.data }));
    } catch (err: any) {
      console.error('Erro ao buscar documentos:', err);
      setError('Erro ao carregar documentos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents on component mount
  useEffect(() => {
    if (formData.id) {
      fetchDocuments();
    }
  }, [formData.id]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload file
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.url;
  };

  const handleAddDocument = async () => {
    if (!formData.id || !newDocument.name) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let fileUrl = '';
      
      // Upload file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
      
      const documentData = {
        ...newDocument,
        medical_record_id: formData.id,
        file_url: fileUrl || newDocument.url,
        date: new Date(newDocument.date || new Date()).toISOString()
      };
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/medical-records/${formData.id}/documents`, documentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const createdDocument = response.data;
      
      // Update local state
      setDocuments(prev => [...prev, createdDocument]);
      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), createdDocument]
      }));
      
      // Reset form
      setNewDocument({
        id: '',
        name: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        url: '',
        added_by: ''
      });
      setSelectedFile(null);
      setIsAdding(false);
      
    } catch (err: any) {
      console.error('Erro ao adicionar documento:', err);
      setError('Erro ao adicionar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument || !formData.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let fileUrl = editingDocument.file_url || editingDocument.url;
      
      // Upload new file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
      
      const documentData = {
        ...editingDocument,
        file_url: fileUrl,
        date: new Date(editingDocument.date || new Date()).toISOString()
      };
      
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/medical-records/documents/${editingDocument.id}`, documentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const updatedDocument = response.data;
      
      // Update local state
      setDocuments(prev => prev.map(doc => doc.id === editingDocument.id ? updatedDocument : doc));
      setFormData(prev => ({
        ...prev,
        documents: prev.documents?.map(doc => doc.id === editingDocument.id ? updatedDocument : doc) || []
      }));
      
      setEditingDocument(null);
      setSelectedFile(null);
      
    } catch (err: any) {
      console.error('Erro ao atualizar documento:', err);
      setError('Erro ao atualizar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!formData.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/medical-records/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setFormData(prev => ({
        ...prev,
        documents: prev.documents?.filter(doc => doc.id !== documentId) || []
      }));
      
    } catch (err: any) {
      console.error('Erro ao excluir documento:', err);
      setError('Erro ao excluir documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDocumentForm = (document: Partial<Document>, isNew: boolean = false) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (isNew) {
        setNewDocument(prev => ({ ...prev, [name]: value }));
      } else {
        setEditingDocument(prev => prev ? { ...prev, [name]: value } : null);
      }
    };

    // Mock file upload - em um ambiente real, isso seria substituído por um upload real
    const handleFileChange = () => {
      const mockFileUrl = 'https://example.com/mock-document-file.pdf';
      if (isNew) {
        setNewDocument(prev => ({ ...prev, url: mockFileUrl }));
      } else {
        setEditingDocument(prev => prev ? { ...prev, url: mockFileUrl } : null);
      }
      alert('Em um ambiente real, este arquivo seria enviado para o servidor. Por enquanto, estamos usando uma URL mockada.');
    };

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isNew ? 'Novo Documento' : 'Editar Documento'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Documento*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={document.name || ''}
                onChange={handleChange}
                placeholder="Nome do documento"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              name="type"
              value={document.type || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um tipo</option>
              <option value="laudo">Laudo</option>
              <option value="atestado">Atestado</option>
              <option value="receita">Receita</option>
              <option value="exame">Resultado de Exame</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Documento
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="date"
                value={document.date?.toString().split('T')[0] || ''}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adicionado por
            </label>
            <input
              type="text"
              name="added_by"
              value={document.added_by || ''}
              onChange={handleChange}
              placeholder="Nome do profissional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={document.description || ''}
            onChange={handleChange}
            placeholder="Descrição do documento"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arquivo
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              className="hidden"
              id={isNew ? "new-document-file" : `edit-document-file-${document.id}`}
              onChange={handleFileChange}
            />
            <label
              htmlFor={isNew ? "new-document-file" : `edit-document-file-${document.id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
            >
              {document.url ? 'Alterar Arquivo' : 'Anexar Arquivo'}
            </label>
            {document.url && (
              <span className="text-sm text-green-600">Arquivo anexado</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              if (isNew) {
                setIsAdding(false);
              } else {
                setEditingDocument(null);
              }
            }}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={isNew ? handleAddDocument : handleUpdateDocument}
            disabled={isLoading || !document.name}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isNew ? 'Adicionar Documento' : 'Atualizar Documento'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
        {!isAdding && !editingDocument && (
          <button
            onClick={() => {
              setSelectedFile(null);
              setIsAdding(true);
            }}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo Documento
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && renderDocumentForm(newDocument, true)}
      
      {editingDocument && renderDocumentForm(editingDocument)}
      
      {/* Loading State */}
      {isLoading && !isAdding && !editingDocument && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando documentos...</span>
        </div>
      )}
      
      {!isAdding && !editingDocument && !isLoading && (
        <div className="space-y-4">
          {documents && documents.length > 0 ? (
            documents.map((document) => (
              <div 
                key={document.id} 
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        {document.name}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        <span>{new Date(document.date).toLocaleDateString('pt-BR')}</span>
                        {document.type && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{document.type.charAt(0).toUpperCase() + document.type.slice(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setEditingDocument(document);
                      }}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Editar documento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {document.description && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Descrição</p>
                    <p className="text-sm text-gray-700">{document.description}</p>
                  </div>
                )}
                
                {document.added_by && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Adicionado por</p>
                    <p className="text-sm text-gray-700">{document.added_by}</p>
                  </div>
                )}
                
                {document.url && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Arquivo</p>
                      <a 
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Baixar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento registrado</h3>
              <p className="text-sm text-gray-500 max-w-md">Adicione documentos médicos para este paciente.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditDocumentsTab;
