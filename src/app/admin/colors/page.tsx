'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { Trash2 } from 'lucide-react';

interface Color {
  id: number;
  name: string;
  code: string;
  hex_code: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hex_code: '#000000',
    sort_order: 0,
    is_active: true,
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      const response = await adminService.getColors();
      setColors(response as any);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load colors' });
    } finally {
      setLoading(false);
    }
  };

  const filteredColors = colors.filter(
    (color) =>
      color.name.toLowerCase().includes(search.toLowerCase()) ||
      color.code.toLowerCase().includes(search.toLowerCase()) ||
      color.hex_code.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setFormData({
        name: color.name,
        code: color.code,
        hex_code: color.hex_code,
        sort_order: color.sort_order,
        is_active: color.is_active,
      });
    } else {
      setEditingColor(null);
      setFormData({
        name: '',
        code: '',
        hex_code: '#000000',
        sort_order: colors.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingColor(null);
    setFormData({ name: '', code: '', hex_code: '#000000', sort_order: 0, is_active: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingColor) {
        const updated = await adminService.updateColor(editingColor.id, formData);
        setColors(colors.map((c) => (c.id === editingColor.id ? { ...c, ...formData } : c)));
        addToast({ type: 'success', message: 'Color updated successfully' });
      } else {
        const created = await adminService.createColor(formData);
        addToast({ type: 'success', message: 'Color created successfully' });
        loadColors();
      }
      closeModal();
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save color',
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await adminService.deleteColor(id);
      setColors(colors.filter((c) => c.id !== id));
      addToast({ type: 'success', message: 'Color deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete color' });
    }
  };

  const toggleColorStatus = async (color: Color) => {
    try {
      await adminService.updateColor(color.id, { is_active: !color.is_active });
      setColors(colors.map((c) => (c.id === color.id ? { ...c, is_active: !c.is_active } : c)));
      addToast({
        type: 'success',
        message: `Color ${!color.is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update color status' });
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
          <p className="mt-4 text-gray-600">Loading colors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Color Management</h1>
          <p className="text-gray-600 mt-1">Manage product colors</p>
        </div>
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
          Add Color
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search colors by name, code, or hex..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Colors Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Preview
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Color Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Hex Code
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
              {filteredColors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No colors found
                  </td>
                </tr>
              ) : (
                filteredColors.map((color) => (
                  <tr key={color.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-2">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: color.hex_code }}
                      ></div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {color.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{color.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                      {color.hex_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(color.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{color.sort_order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleColorStatus(color)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          color.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            color.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(color)}
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
                          onClick={() => handleDelete(color.id, color.name)}
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
              {editingColor ? 'Edit Color' : 'Add New Color'}
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
                  placeholder="e.g., Navy Blue, Forest Green"
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
                  placeholder="e.g., navy-blue, forest-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hex Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.hex_code}
                    onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.hex_code}
                    onChange={(e) =>
                      setFormData({ ...formData, hex_code: e.target.value.toUpperCase() })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingColor ? 'Update Color' : 'Create Color'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
