/**
 * Admin Sizes Page
 * Production-ready implementation with token-based authentication
 * @module admin/sizes/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import TokenManager from '@/lib/tokenManager';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';

interface Size {
  id: number;
  name: string;
  code: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminSizesPage() {
  const router = useRouter();
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    sort_order: 0,
    is_active: true,
  });
  const { addToast } = useToast();

  // Check authentication on mount
  useEffect(() => {
    if (!TokenManager.isAuthenticated()) {
      router.replace('/admin/login');
      return;
    }
    loadSizes();
  }, []);

  const loadSizes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!TokenManager.isAuthenticated()) {
        router.replace('/admin/login');
        return;
      }

      const response = await adminService.getSizes();
      setSizes(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Failed to load sizes:', error);
      const errorMessage = error?.message || 'Failed to load sizes';
      setError(errorMessage);
      
      if (error?.type === 'forbidden' || error?.response?.status === 401) {
        addToast({
          type: 'error',
          message: 'Session expired. Please login again.',
        });
        TokenManager.clearToken();
        router.replace('/admin/login');
      } else {
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [router, addToast]);

  const filteredSizes = sizes.filter(
    (size) =>
      size.name.toLowerCase().includes(search.toLowerCase()) ||
      size.code.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (size?: Size) => {
    if (size) {
      setEditingSize(size);
      setFormData({
        name: size.name,
        code: size.code,
        sort_order: size.sort_order,
        is_active: size.is_active,
      });
    } else {
      setEditingSize(null);
      setFormData({
        name: '',
        code: '',
        sort_order: sizes.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSize(null);
    setFormData({ name: '', code: '', sort_order: 0, is_active: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      addToast({ type: 'error', message: 'Size name is required' });
      return;
    }
    if (!formData.code.trim()) {
      addToast({ type: 'error', message: 'Size code is required' });
      return;
    }

    setSaving(true);
    try {
      if (editingSize) {
        await adminService.updateSize(editingSize.id, formData);
        setSizes(sizes.map((s) => (s.id === editingSize.id ? { ...s, ...formData } : s)));
        addToast({ type: 'success', message: 'Size updated successfully' });
      } else {
        await adminService.createSize(formData);
        addToast({ type: 'success', message: 'Size created successfully' });
        await loadSizes();
      }
      closeModal();
    } catch (error: any) {
      console.error('Failed to save size:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to save size';
      addToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      await adminService.deleteSize(id);
      setSizes(sizes.filter((s) => s.id !== id));
      addToast({ type: 'success', message: 'Size deleted successfully' });
    } catch (error: any) {
      console.error('Failed to delete size:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete size';
      addToast({ type: 'error', message: errorMessage });
    }
  };

  const toggleSizeStatus = async (size: Size) => {
    try {
      await adminService.updateSize(size.id, { is_active: !size.is_active });
      setSizes(sizes.map((s) => (s.id === size.id ? { ...s, is_active: !s.is_active } : s)));
      addToast({
        type: 'success',
        message: `Size ${!size.is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Failed to update size status:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update size status';
      addToast({ type: 'error', message: errorMessage });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sizes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Sizes</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadSizes}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Size Management</h1>
          <p className="text-gray-600 mt-1">
            {sizes.length} {sizes.length === 1 ? 'size' : 'sizes'} available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSizes}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Size
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sizes by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sizes Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Size Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    Last Updated
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Sort Order
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSizes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No sizes found
                  </td>
                </tr>
              ) : (
                filteredSizes.map((size) => (
                  <tr key={size.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {size.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{size.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(size.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{size.sort_order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSizeStatus(size)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          size.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            size.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(size)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(size.id, size.name)}
                          className="text-red-700 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingSize ? 'Edit Size' : 'Add New Size'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Small, Medium, Large"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., s, m, l"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    editingSize ? 'Update Size' : 'Create Size'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
