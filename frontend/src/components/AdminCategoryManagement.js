import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import '../styles/AdminCategoryManagement.css'; // Import regular CSS

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', color: '#000000' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingCategory
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';
      const method = editingCategory ? 'put' : 'post';
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
      setEditingCategory(null);
      setFormData({ name: '', color: '#000000' });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="category-management">
        <h1>Manage Categories</h1>
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Category Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Category Color</label>
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingCategory ? 'Update Category' : 'Add Category'}
            </button>
            {editingCategory && (
              <button type="button" className="btn-secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="categories-list">
          {categories.length === 0 ? (
            <p className="no-categories">No categories found.</p>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="category-item" style={{ borderLeft: `5px solid ${category.color}` }}>
                <h3>{category.name}</h3>
                <p>
                  <strong>Color:</strong> <span style={{ color: category.color }}>{category.color}</span>
                </p>
                <div className="category-actions">
                  <button className="btn-edit" onClick={() => handleEdit(category)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(category._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminCategoryManagement;
