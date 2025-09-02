import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Permissions() {
  const isMobile = useIsMobile();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permToDelete, setPermToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/permissions`, { headers });
      setPermissions(res.data);
    } catch (err) {
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (perm: any = null) => {
    if (perm) {
      setEditing(perm);
      setForm({
        name: perm.name,
        description: perm.description || '',
        is_active: perm.is_active,
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', is_active: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleFormChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (editing) {
        await axios.put(`${API_BASE}/permissions/${editing.id}`, form, { headers });
      } else {
        await axios.post(`${API_BASE}/permissions`, form, { headers });
      }
      closeModal();
      fetchPermissions();
    } catch (err) {
      // Trate erros conforme necessário
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (perm: any) => {
    setPermToDelete(perm);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPermToDelete(null);
  };

  const handleDelete = async () => {
    if (!permToDelete) return;
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE}/permissions/${permToDelete.id}`, { headers });
      closeDeleteModal();
      fetchPermissions();
    } catch (err) {
      // Trate erros conforme necessário
    }
  };

  return (
    <div>
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'} mb-6`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-700`}>Permissões do Sistema</h2>
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow flex items-center ${
            isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
          }`}
          onClick={() => openModal()}
        >
          <Plus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
          Nova Permissão
        </button>
      </div>
      {isMobile ? (
        // Layout de cards para mobile
        <div className="space-y-4">
          {loading ? (
            <div className="text-gray-400 text-center py-8">Carregando permissões...</div>
          ) : permissions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Nenhuma permissão cadastrada ainda.<br />
              <span className="text-blue-500">Clique em "Nova Permissão" para começar.</span>
            </div>
          ) : (
            permissions.map((perm: any) => (
              <div key={perm.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{perm.name}</h3>
                  <div className="flex gap-1">
                    <button
                      className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                      title="Editar"
                      onClick={() => openModal(perm)}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      className="text-red-600 hover:bg-red-100 p-1 rounded"
                      title="Excluir"
                      onClick={() => openDeleteModal(perm)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-xs mb-2">{perm.description}</p>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  perm.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {perm.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        // Layout de tabela para desktop
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Nome</th>
                <th className="py-2 px-4 text-left">Descrição</th>
                <th className="py-2 px-4 text-left">Ativa</th>
                <th className="py-2 px-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-4 px-4 text-gray-400 text-center" colSpan={4}>Carregando permissões...</td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td className="py-4 px-4 text-gray-400 text-center" colSpan={4}>
                    Nenhuma permissão cadastrada ainda.<br />
                    <span className="text-blue-500">Clique em "Nova Permissão" para começar.</span>
                  </td>
                </tr>
              ) : (
                permissions.map((perm: any) => (
                  <tr key={perm.id} className="border-t">
                    <td className="py-2 px-4">{perm.name}</td>
                    <td className="py-2 px-4">{perm.description}</td>
                    <td className="py-2 px-4">{perm.is_active ? 'Sim' : 'Não'}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                        title="Editar"
                        onClick={() => openModal(perm)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-100 p-1 rounded"
                        title="Excluir"
                        onClick={() => openDeleteModal(perm)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal de cadastro/edição de permissão */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Editar Permissão' : 'Nova Permissão'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nome da Permissão</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
              required
              placeholder="Ex: users.view, medical_record.sign"
              disabled={!!editing}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Descrição</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.description}
              onChange={e => handleFormChange('description', e.target.value)}
              placeholder="Descreva a funcionalidade desta permissão"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Ativa?</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.is_active ? 'true' : 'false'}
              onChange={e => handleFormChange('is_active', e.target.value === 'true')}
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={closeModal}
              disabled={saving}
            >Cancelar</button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={saving}
            >{editing ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      </Modal>
      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={deleteModalOpen} onClose={closeDeleteModal} title="Excluir Permissão" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">Tem certeza que deseja excluir a permissão <span className="font-semibold text-red-600">{permToDelete?.name}</span>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={closeDeleteModal}
            >Cancelar</button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            >Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
