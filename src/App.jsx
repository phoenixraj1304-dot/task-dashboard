import React, { useEffect, useMemo, useState } from 'react';
import {
  ArchiveBoxIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  CheckCircleIcon,
  ChevronDownIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'task-dashboard-inventory';

const starterItems = [
  { id: 'itm-1', name: 'Aster Ceramic Mug', sku: 'AST-MUG-01', category: 'Homeware', quantity: 42, reorderThreshold: 12, unitPrice: 18.5 },
  { id: 'itm-2', name: 'Canvas Weekender', sku: 'CVS-WKD-02', category: 'Accessories', quantity: 8, reorderThreshold: 10, unitPrice: 64 },
  { id: 'itm-3', name: 'Linen Throw Blanket', sku: 'LNB-THR-03', category: 'Homeware', quantity: 0, reorderThreshold: 8, unitPrice: 92 },
  { id: 'itm-4', name: 'Daily Planner 2025', sku: 'DPL-25-04', category: 'Stationery', quantity: 76, reorderThreshold: 20, unitPrice: 24 },
  { id: 'itm-5', name: 'Brass Desk Lamp', sku: 'BDL-LMP-05', category: 'Workspace', quantity: 16, reorderThreshold: 6, unitPrice: 115 },
  { id: 'itm-6', name: 'Walnut Phone Stand', sku: 'WPS-STD-06', category: 'Workspace', quantity: 31, reorderThreshold: 10, unitPrice: 32 },
];

const emptyForm = { name: '', sku: '', category: '', quantity: '', reorderThreshold: '', unitPrice: '' };

function getStatus(item) {
  if (item.quantity === 0) return 'Out of stock';
  if (item.quantity <= item.reorderThreshold) return 'Low stock';
  return 'In stock';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function App() {
  const [items, setItems] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : starterItems;
    } catch {
      return starterItems;
    }
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState('All status');
  const [view, setView] = useState('table');
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const categories = useMemo(() => ['All categories', ...new Set(items.map((item) => item.category))], [items]);
  const filteredItems = useMemo(() => items.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(term);
    const matchesCategory = category === 'All categories' || item.category === category;
    const matchesStatus = status === 'All status' || getStatus(item) === status;
    return matchesSearch && matchesCategory && matchesStatus;
  }), [items, search, category, status]);

  const metrics = useMemo(() => ({
    products: items.length,
    value: items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    lowStock: items.filter((item) => getStatus(item) === 'Low stock').length,
    outOfStock: items.filter((item) => getStatus(item) === 'Out of stock').length,
  }), [items]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ ...item, quantity: String(item.quantity), reorderThreshold: String(item.reorderThreshold), unitPrice: String(item.unitPrice) });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required';
    if (!form.sku.trim()) nextErrors.sku = 'SKU is required';
    if (!form.category.trim()) nextErrors.category = 'Category is required';
    if (form.quantity === '' || Number(form.quantity) < 0) nextErrors.quantity = 'Enter a quantity of 0 or more';
    if (form.reorderThreshold === '' || Number(form.reorderThreshold) < 0) nextErrors.reorderThreshold = 'Enter a threshold of 0 or more';
    if (form.unitPrice === '' || Number(form.unitPrice) < 0) nextErrors.unitPrice = 'Enter a price of 0 or more';
    const duplicateSku = items.some((item) => item.sku.toLowerCase() === form.sku.trim().toLowerCase() && item.id !== editingItem?.id);
    if (duplicateSku) nextErrors.sku = 'SKU must be unique';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveItem = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const nextItem = {
      id: editingItem?.id || `itm-${Date.now()}`,
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
      reorderThreshold: Number(form.reorderThreshold),
      unitPrice: Number(form.unitPrice),
    };
    setItems((current) => editingItem ? current.map((item) => item.id === editingItem.id ? nextItem : item) : [nextItem, ...current]);
    setIsFormOpen(false);
  };

  const deleteItem = (item) => {
    if (window.confirm(`Delete ${item.name}?`)) setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="inventory-app">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><CubeIcon /></span><span>Stockwise</span></div>
        <div className="workspace-switcher"><span className="workspace-dot" /> Acme workspace <ChevronDownIcon /></div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#inventory"><ArchiveBoxIcon /> Inventory</a>
          <a className="nav-item" href="#overview"><Squares2X2Icon /> Overview</a>
        </nav>
        <div className="sidebar-footer"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><span>Admin</span></div><ChevronDownIcon /></div>
      </aside>

      <main className="main-content" id="inventory">
        <header className="topbar"><button className="mobile-menu" aria-label="Open menu"><Bars3Icon /></button><div className="breadcrumb">Workspace <span>/</span> Inventory</div><div className="topbar-actions"><button className="icon-button" aria-label="Search"><MagnifyingGlassIcon /></button><div className="avatar small">JD</div></div></header>
        <div className="page-content">
          <section className="page-heading">
            <div><p className="eyebrow">Thursday, September 17, 2026</p><h1>Inventory</h1><p className="subtitle">Keep your stock levels healthy and your team moving.</p></div>
            <button className="primary-button" onClick={openCreate}><PlusIcon /> Add item</button>
          </section>

          <section className="metric-grid" aria-label="Inventory summary">
            <MetricCard label="Total products" value={metrics.products} detail="Across all categories" icon={<CubeIcon />} tone="purple" />
            <MetricCard label="Inventory value" value={formatCurrency(metrics.value)} detail="Current stock valuation" icon={<ArrowTrendingUpIcon />} tone="blue" />
            <MetricCard label="Low-stock items" value={metrics.lowStock} detail="Need your attention" icon={<ArrowTrendingDownIcon />} tone="orange" />
            <MetricCard label="Out of stock" value={metrics.outOfStock} detail="Currently unavailable" icon={<ArchiveBoxIcon />} tone="red" />
          </section>

          <section className="inventory-panel">
            <div className="panel-heading"><div><h2>All inventory</h2><p>{filteredItems.length} of {items.length} items</p></div><div className="view-toggle"><button className={view === 'table' ? 'selected' : ''} onClick={() => setView('table')} aria-label="Table view"><Bars3Icon /></button><button className={view === 'cards' ? 'selected' : ''} onClick={() => setView('cards')} aria-label="Card view"><Squares2X2Icon /></button></div></div>
            <div className="filter-bar">
              <label className="search-field"><MagnifyingGlassIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, SKU or category" /></label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((option) => <option key={option}>{option}</option>)}</select>
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All status</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select>
            </div>
            {filteredItems.length === 0 ? <div className="empty-state"><CubeIcon /><h3>No items found</h3><p>Try adjusting your filters or add a new item.</p></div> : view === 'table' ? (
              <div className="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Unit price</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{filteredItems.map((item) => <InventoryRow key={item.id} item={item} onEdit={openEdit} onDelete={deleteItem} />)}</tbody></table></div>
            ) : <div className="card-grid">{filteredItems.map((item) => <InventoryCard key={item.id} item={item} onEdit={openEdit} onDelete={deleteItem} />)}</div>}
          </section>
        </div>
      </main>

      {isFormOpen && <ItemModal form={form} errors={errors} editing={Boolean(editingItem)} onChange={updateField} onSave={saveItem} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></div>;
}

function StatusBadge({ item }) {
  const currentStatus = getStatus(item);
  return <span className={`status-badge ${currentStatus.toLowerCase().replace(' ', '-')}`}><span />{currentStatus}</span>;
}

function InventoryRow({ item, onEdit, onDelete }) {
  return <tr><td><div className="item-cell"><div className="item-thumb">{item.name.charAt(0)}</div><div><strong>{item.name}</strong><span>{item.sku}</span></div></div></td><td><span className="category-text">{item.category}</span></td><td><strong>{item.quantity}</strong><span className="threshold"> / {item.reorderThreshold} min</span></td><td>{formatCurrency(item.unitPrice)}</td><td><StatusBadge item={item} /></td><td><div className="row-actions"><button onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><PencilSquareIcon /></button><button onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}><TrashIcon /></button></div></td></tr>;
}

function InventoryCard({ item, onEdit, onDelete }) {
  return <article className="inventory-card"><div className="card-top"><div className="item-cell"><div className="item-thumb">{item.name.charAt(0)}</div><div><strong>{item.name}</strong><span>{item.sku}</span></div></div><StatusBadge item={item} /></div><div className="card-details"><span>Category <strong>{item.category}</strong></span><span>Quantity <strong>{item.quantity} / {item.reorderThreshold} min</strong></span><span>Unit price <strong>{formatCurrency(item.unitPrice)}</strong></span></div><div className="card-actions"><button onClick={() => onEdit(item)}><PencilSquareIcon /> Edit</button><button onClick={() => onDelete(item)}><TrashIcon /> Delete</button></div></article>;
}

function ItemModal({ form, errors, editing, onChange, onSave, onClose }) {
  const fields = [['name', 'Item name', 'e.g. Ceramic mug', 'text'], ['sku', 'SKU', 'e.g. AST-MUG-01', 'text'], ['category', 'Category', 'e.g. Homeware', 'text'], ['quantity', 'Quantity', '0', 'number'], ['reorderThreshold', 'Reorder threshold', '10', 'number'], ['unitPrice', 'Unit price', '0.00', 'number']];
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="item-modal-title"><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Update inventory' : 'New inventory'}</p><h2 id="item-modal-title">{editing ? 'Edit item' : 'Add an item'}</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><XMarkIcon /></button></div><form onSubmit={onSave}><div className="form-grid">{fields.map(([key, label, placeholder, type]) => <label key={key} className={key === 'name' || key === 'sku' || key === 'category' ? 'full-field' : ''}>{label}<input type={type} min={type === 'number' ? '0' : undefined} step={key === 'unitPrice' ? '0.01' : '1'} value={form[key]} onChange={(event) => onChange(key, event.target.value)} placeholder={placeholder} aria-invalid={Boolean(errors[key])} />{errors[key] && <span className="field-error">{errors[key]}</span>}</label>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">{editing ? 'Save changes' : 'Add item'}</button></div></form></div></div>;
}

export default App;
