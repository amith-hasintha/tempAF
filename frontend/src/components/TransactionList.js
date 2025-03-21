import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import '../styles/TransactionList.css';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    category: '',
    description: '',
    date: '',
  });

  const [users, setUsers] = useState({}); // Store user names by userId

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found. Please log in.');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const res = await axios.get('http://localhost:5000/api/transactions', config);
        setTransactions(res.data);

        // Fetch user names for each transaction's userId
        const userIds = res.data.map((transaction) => transaction.user);
        const uniqueUserIds = [...new Set(userIds)];

        // Fetch user names by IDs
        const usersData = {};
        for (const userId of uniqueUserIds) {
          const userRes = await axios.get(`http://localhost:5000/api/auth/${userId}`, config);
          usersData[userId] = userRes.data.name; // Assuming user data has 'name' field
        }

        setUsers(usersData); // Save all users' names in the state
      } catch (error) {
        console.error('Error fetching transactions or users:', error.response?.data || error.message);
      }
    };

    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found.');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(`http://localhost:5000/api/transactions/${id}`, config);
      setTransactions(transactions.filter((transaction) => transaction._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error.response?.data || error.message);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || '',
      date: transaction.date.split('T')[0], // Format date for input field
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      if (!editingTransaction) return;

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found.');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.put(
        `http://localhost:5000/api/transactions/${editingTransaction._id}`,
        formData,
        config
      );

      setTransactions(
        transactions.map((t) =>
          t._id === editingTransaction._id ? res.data.transaction : t
        )
      );

      setEditingTransaction(null);
      setFormData({
        type: '',
        amount: '',
        category: '',
        description: '',
        date: '',
      });
    } catch (error) {
      console.error('Error updating transaction:', error.response?.data || error.message);
    }
  };

  // Helper function to get the user name based on user ID
  const getUserName = (userId) => {
    return users[userId] || 'Unknown'; // Return 'Unknown' if no user is found
  };

  return (
    <>
      <AdminSidebar />
      <div className="transaction-list">
        <h2>Admin - Manage Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <p>
                <strong>User:</strong> {getUserName(transaction.user)} |{' '}
                <strong>Category:</strong> {transaction.category} |{' '}
                <strong>Amount:</strong> ${transaction.amount}
              </p>
              <div className="button-container">
                <button onClick={() => handleEditClick(transaction)}>Edit</button>
                <button onClick={() => handleDelete(transaction._id)}>Delete</button>
              </div>
            </div>
          ))
        )}

        {editingTransaction && (
          <div className="edit-form">
            <h3>Edit Transaction</h3>
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
            />

            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="salary">Salary</option>
              <option value="other">Other</option>
            </select>

            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />

            <button onClick={handleUpdate}>Update</button>
            <button onClick={() => setEditingTransaction(null)}>Cancel</button>
          </div>
        )}
      </div>
      <AdminFooter />
    </>
  );
};

export default TransactionList;