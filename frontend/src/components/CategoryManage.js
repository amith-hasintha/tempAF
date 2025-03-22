import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CategoryManagement.css'; // Import your stylesheet
import AdminSidebar from './AdminSidebar';
import Footer from './AdminFooter';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [editingCategory, setEditingCategory] = useState(null); // For editing categories

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submit for adding or editing a category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingCategory) {
        // Edit category
        const response = await axios.put(
          `http://localhost:5000/api/categories/${editingCategory._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(categories.map((cat) => (cat._id === editingCategory._id ? response.data : cat)));
        setEditingCategory(null); // Reset editing
      } else {
        // Add new category
        const response = await axios.post(
          'http://localhost:5000/api/categories',
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setCategories([...categories, response.data]);
      }
      setFormData({ name: '' }); // Reset form
    } catch (error) {
      console.error('Error submitting category:', error.response?.data || error.message);
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((category) => category._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error.response?.data || error.message);
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setFormData({ name: category.name });
    setEditingCategory(category);
  };

  return (
    <>
      <AdminSidebar/>
      <div className="category-management">
        <h1 style={{color:'white'}}>Category Management</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{editingCategory ? 'Update Category' : 'Add Category'}</button>
        </form>

        <div className="categories-list">
          {categories.length === 0 ? (
            <p>No categories available.</p>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="category-item">
                <h3>{category.name}</h3>
                <button onClick={() => handleEdit(category)}>Edit</button>
                <button onClick={() => handleDelete(category._id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryManagement;
