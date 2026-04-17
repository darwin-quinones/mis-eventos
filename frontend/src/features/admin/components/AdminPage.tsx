import { useEffect, useState } from 'react';
import { adminApi, type UserUpdate } from '../../../api/admin.api';
import type { User } from '../../../types/user';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../../utils/alerts';
import { useAuthStore } from '../../../store/auth.store';

export const AdminPage = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, pages: 0 });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [pagination.page]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers(pagination.page, pagination.size);
      setUsers(response.items);
      setPagination({
        page: response.page,
        size: response.size,
        total: response.total,
        pages: response.pages,
      });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role as 'asistente' | 'organizador' | 'admin',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      await adminApi.updateUser(editingUser.id, formData);
      await loadUsers();
      closeModal();
      await showSuccessAlert('Usuario actualizado', 'Los cambios han sido guardados');
    } catch (error: any) {
      await showErrorAlert(
        'Error al actualizar',
        error.response?.data?.detail || 'No se pudo actualizar el usuario'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = await showConfirmDialog(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar a ${user.full_name}? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmed) return;

    try {
      await adminApi.deleteUser(user.id);
      await loadUsers();
      await showSuccessAlert('Usuario eliminado', 'El usuario ha sido eliminado correctamente');
    } catch (error: any) {
      await showErrorAlert(
        'Error al eliminar',
        error.response?.data?.detail || 'No se pudo eliminar el usuario'
      );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'organizador':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'organizador':
        return 'Organizador';
      default:
        return 'Asistente';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Panel de Administración
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Gestiona usuarios y sus permisos
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-500"
                      >
                        Editar
                      </button>
                      {user.id !== currentUser?.id ? (
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                        >
                          Eliminar
                        </button>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                          Eliminar
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Mostrando {users.length} de {pagination.total} usuarios
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Editar Usuario">
        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            type="text"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Rol
            </label>
            <select
              value={formData.role || 'asistente'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              {/* Asistente: solo puede quedarse como asistente */}
              {editingUser?.role === 'asistente' && (
                <option value="asistente">Asistente</option>
              )}
              
              {/* Organizador: puede quedarse como organizador o ser promovido a admin */}
              {editingUser?.role === 'organizador' && (
                <>
                  <option value="organizador">Organizador</option>
                  <option value="admin">Administrador</option>
                </>
              )}
              
              {/* Admin: solo puede quedarse como admin */}
              {editingUser?.role === 'admin' && (
                <option value="admin">Administrador</option>
              )}
            </select>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {editingUser?.role === 'asistente' && 'Los asistentes no pueden ser promovidos'}
              {editingUser?.role === 'organizador' && 'Puede ser promovido a Administrador'}
              {editingUser?.role === 'admin' && 'No se puede cambiar el rol de un administrador'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} isLoading={isSaving}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
