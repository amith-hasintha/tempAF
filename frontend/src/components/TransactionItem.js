import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TransactionItem.css'; // Import global CSS
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const TransactionItem = () => {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: '', category: '', description: '' });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found. Please log in.');
          return;
        }
  
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id; // Extract user ID from the token
  
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`http://localhost:5000/api/transactions/${userId}`, config);
        
        setTransactions(res.data);
      } catch (error) {
        console.error('Error fetching transactions:', error.response?.data || error.message);
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

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, config);

      setTransactions(transactions.filter(transaction => transaction._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error.response?.data || error.message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setEditData({ amount: transaction.amount, category: transaction.category, description: transaction.description });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`http://localhost:5000/api/transactions/${id}`, editData, config);

      setTransactions(transactions.map(transaction =>
        transaction._id === id ? res.data.transaction : transaction
      ));
      
      setEditingId(null);
    } catch (error) {
      console.error('Error updating transaction:', error.response?.data || error.message);
    }
  };
  
  const navigate = useNavigate();

  return (
    <>
      <UserHeader />
      <div className="transactionList">
        <div className="header12">
          <h2 className="heading">Your Transactions</h2>
          <button className="addButton" onClick={() => navigate('/add-transaction')}>
            + Add Transaction
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="noTransactions">No transactions found.</p>
        ) : (
          transactions.map(transaction => (
            <div key={transaction._id} className="transactionItem">
              {editingId === transaction._id ? (
                <div className="editContainer">
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                  />
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="salary">Salary</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                  <button className="saveButton" onClick={() => handleUpdate(transaction._id)}>Save</button>
                  <button className="cancelButton" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <div className="transactionDetails">
                  <p className="category">{transaction.category} - <span className="amount">${transaction.amount}</span></p>
                  <p className="description">{transaction.description}</p>
                  <button className="editButton" onClick={() => handleEdit(transaction)}>Edit</button>
                  <button className="deleteButton" onClick={() => handleDelete(transaction._id)}>Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <UserFooter />
    </>
  );
};

export default TransactionItem;
