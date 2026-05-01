import { useState, useEffect } from 'react';
import { categoryApi } from '../../api/categoryApi';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { Plus, Edit3, Trash2, FolderTree } from 'lucide-react';
import { parseApiError } from '../../utils/errors';

export default function CategoryManagePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', parent: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', parent: cat.parent?.id || cat.parent || '' });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', icon: '', parent: '' });
    }
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.parent) delete payload.parent;
      if (!payload.icon) delete payload.icon;
      if (!payload.description) delete payload.description;

      if (editing) {
        await categoryApi.update(editing.id, payload);
        setMsg({ type: 'success', text: 'Category updated' });
      } else {
        await categoryApi.create(payload);
        setMsg({ type: 'success', text: 'Category created' });
      }
      setModalOpen(false);
      fetchCategories();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      const { message } = parseApiError(err);
      setMsg({ type: 'error', text: message });
    } finally {
      setSaving(false);
    }
  };

  const deleteCat = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryApi.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
      setMsg({ type: 'success', text: 'Category deleted' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      const { message } = parseApiError(err);
      setMsg({ type: 'error', text: message });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <button onClick={() => openModal()} className="btn-primary gap-2">
          <Plus size={18} /> New Category
        </button>
      </div>

      {msg.text && <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />}

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderTree size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No categories yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create your first category to organize courses</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">{cat.icon || '📁'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{cat.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  {cat.description && <span className="truncate max-w-xs">{cat.description}</span>}
                  <span>{cat.courseCount || 0} courses</span>
                  {cat.parent?.name && <span>Parent: {cat.parent.name}</span>}
                </div>
              </div>
              <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                <Edit3 size={16} />
              </button>
              <button onClick={() => deleteCat(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Web Development"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 💻"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Parent Category</label>
            <select
              className="input-field"
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
            >
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => c.id !== editing?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
