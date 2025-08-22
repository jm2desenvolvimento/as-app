import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalRecord, Document } from '../../../types/medical-record';
import { Plus, Edit2, Trash2, Calendar, FileText, Loader2, Upload, Download } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface EditDocumentsTabProps {
  formData: Partial<MedicalRecord>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MedicalRecord>>>;
  onValidationChange?: (isValid: boolean) => void;
}

const EditDocumentsTab: React.FC<EditDocumentsTabProps> = ({ formData, setFormData }) => {
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    id: '',
    name: '',
    type: 'Documento', // Valor padrão para satisfazer validação (mínimo 3 chars)
    date: new Date().toISOString().split('T')[0],
    description: '',
    file_url: '', // ✅ CORRIGIDO: Usar file_url consistentemente
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
      const response = await axios.get(`/medical-records/${formData.id}/documents`, {
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

  // Preencher campos automaticamente com dados do usuário logado
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user?.profile?.name) {
      const doctorName = user.profile.name;
      console.log('[EditDocumentsTab] Preenchendo campos automaticamente:', { doctorName, user });
      
      // Preencher o campo added_by automaticamente
      setNewDocument(prev => {
        const updated = {
          ...prev,
          added_by: doctorName
        };
        console.log('[EditDocumentsTab] newDocument atualizado:', updated);
        return updated;
      });
    }
  }, []);

  // Preencher added_by quando editingDocument for definido
  useEffect(() => {
    if (editingDocument && !editingDocument.added_by) {
      const { user } = useAuthStore.getState();
      if (user?.profile?.name) {
        setEditingDocument(prev => prev ? {
          ...prev,
          added_by: user.profile.name
        } : null);
      }
    }
  }, [editingDocument]);

  // ✅ IMPLEMENTADO: Upload de arquivos usando Base64 (igual à tab de exames)
  const uploadFile = async (file: File): Promise<string> => {
    try {
      // Validação de tamanho no frontend (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB em bytes
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. Tamanho máximo permitido: 10MB. Seu arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      }

      // Validação de tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não permitido: ${file.type}. Tipos aceitos: PDF, JPEG, PNG, GIF, DOC, DOCX, TXT`);
      }

      // Converter arquivo para Base64
      const base64Data = await convertFileToBase64(file);
      
      const uploadData = {
        medical_record_id: formData.id,
        original_name: file.name,
        file_data: base64Data, // Base64 string
        file_size: file.size,
        mime_type: file.type,
        description: `Documento: ${newDocument.name}`
      };
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/medical-records/upload', uploadData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Retorna o ID do arquivo salvo para referência
      return response.data.id;
    } catch (error: any) {
      console.error('[EditDocumentsTab] Erro no upload:', error);
      
      // Tratamento específico para erros de validação
      if (error.message?.includes('Arquivo muito grande') || error.message?.includes('Tipo de arquivo não permitido')) {
        throw error; // Re-throw para mostrar a mensagem específica
      }
      
      // Tratamento para outros erros
      if (error.response?.status === 413) {
        throw new Error('Arquivo muito grande para o servidor processar. Tente um arquivo menor.');
      }
      
      throw new Error('Falha no upload do arquivo');
    }
  };

  // Função auxiliar para converter arquivo para Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Falha na conversão para Base64'));
        }
      };
      reader.onerror = () => reject(new Error('Erro na leitura do arquivo'));
      reader.readAsDataURL(file);
    });
  };

  // ✅ IMPLEMENTADO: Validação imediata de arquivo (igual à tab de exames)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação imediata do arquivo
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setError(`Arquivo muito grande: ${sizeMB}MB. Tamanho máximo: 10MB`);
        e.target.value = ''; // Limpa o input
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de arquivo não permitido: ${file.type}`);
        e.target.value = ''; // Limpa o input
        return;
      }

      // Arquivo válido
      setSelectedFile(file);
      setError(null); // Limpa erros anteriores
    }
  };

  const handleAddDocument = async () => {
    if (!formData.id) {
      setError('ID do prontuário não encontrado');
      return;
    }
    
    // Validar se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.id)) {
      setError('ID do prontuário não é um UUID válido');
      return;
    }
    
    if (!newDocument.name || newDocument.name.trim().length < 3) {
      setError('Nome do documento deve ter pelo menos 3 caracteres');
      return;
    }
    
    if (!newDocument.type || newDocument.type.trim().length < 3) {
      setError('Tipo do documento deve ter pelo menos 3 caracteres');
      return;
    }
    
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      setError('Usuário não está logado ou ID não encontrado');
      return;
    }
    
    if (!newDocument.added_by || newDocument.added_by.trim().length < 3) {
      setError('Campo "Adicionado por" deve ter pelo menos 3 caracteres');
      return;
    }
    
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
        uploader_id: useAuthStore.getState().user?.id || '',
        file_url: fileUrl || 'https://placeholder.com/document.pdf', // Backend espera file_url com pelo menos 10 chars
        added_by: newDocument.added_by, // Manter para compatibilidade com frontend
        date: new Date(newDocument.date || new Date()).toISOString()
      };
      
      console.log('[EditDocumentsTab] Dados do documento a serem enviados:', documentData);
      console.log('[EditDocumentsTab] Usuário logado:', useAuthStore.getState().user);
      console.log('[EditDocumentsTab] ID do usuário:', useAuthStore.getState().user?.id);
      console.log('[EditDocumentsTab] ID do prontuário:', formData.id);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`/medical-records/documents`, documentData, {
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
        type: 'Documento', // Valor padrão para satisfazer validação
        date: new Date().toISOString().split('T')[0],
        description: '',
        file_url: '', // ✅ CORRIGIDO: Usar file_url consistentemente
        added_by: ''
      });
      setSelectedFile(null);
      setIsAdding(false);
      
    } catch (err: any) {
      console.error('Erro ao adicionar documento:', err);
      
      // Tratamento específico para erros de validação de arquivo
      if (err.message?.includes('Arquivo muito grande') || err.message?.includes('Tipo de arquivo não permitido')) {
        setError(err.message);
      } else if (err.message?.includes('Falha no upload do arquivo')) {
        setError('Erro no upload do arquivo. Verifique o tamanho e tipo do arquivo.');
      } else {
      setError('Erro ao adicionar documento. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument || !formData.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let fileUrl = editingDocument.file_url;
      
      // Upload new file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
      
      const documentData = {
        ...editingDocument,
        uploader_id: useAuthStore.getState().user?.id || '',
        file_url: fileUrl || 'https://placeholder.com/document.pdf', // Backend espera file_url com pelo menos 10 chars
        added_by: editingDocument.added_by, // Manter para compatibilidade com frontend
        date: new Date(editingDocument.date || new Date()).toISOString()
      };
      
      const token = localStorage.getItem('token');
      const response = await axios.put(`/medical-records/documents/${editingDocument.id}`, documentData, {
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
      
      // Tratamento específico para erros de validação de arquivo
      if (err.message?.includes('Arquivo muito grande') || err.message?.includes('Tipo de arquivo não permitido')) {
        setError(err.message);
      } else if (err.message?.includes('Falha no upload do arquivo')) {
        setError('Erro no upload do arquivo. Verifique o tamanho e tipo do arquivo.');
      } else {
      setError('Erro ao atualizar documento. Tente novamente.');
      }
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
      await axios.delete(`/medical-records/documents/${documentId}`, {
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

    // ✅ CORRIGIDO: Removida função mock - agora usa a função real handleFileChange

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
              value={document.type || 'Documento'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Documento">Documento</option>
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
              Adicionado por <span className="text-xs text-gray-500">(Preenchido automaticamente)</span>
            </label>
            <input
              type="text"
              name="added_by"
              value={document.added_by || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anexar Arquivo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              className="hidden"
              id={isNew ? "new-document-file" : `edit-document-file-${document.id}`}
            />
            <label htmlFor={isNew ? "new-document-file" : `edit-document-file-${document.id}`} className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Clique para selecionar um arquivo ou arraste aqui
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG, DOC, DOCX, TXT até 10MB
              </p>
              <p className="text-xs text-red-500 mt-1 font-medium">
                ⚠️ Arquivos muito grandes podem causar lentidão
              </p>
            </label>
          </div>
          
          {selectedFile && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg mt-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          )}
          
          {document.file_url && !selectedFile && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg mt-3">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Arquivo atual</span>
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}
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
        <div>
        <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          <p className="text-sm text-gray-500 mt-1">Documentos salvam automaticamente quando você clica em "Adicionar Documento"</p>
        </div>
        {!isAdding && !editingDocument && (
          <button
            onClick={() => {
              setSelectedFile(null);
              setIsAdding(true);
            }}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Adiciona e salva o documento imediatamente no banco de dados"
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
                
                {document.file_url && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Arquivo</p>
                      <a 
                        href={document.file_url}
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
