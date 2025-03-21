const Transaction = require('../models/transaction');

// Add new transaction
exports.addTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, tags, isRecurring, recurrencePattern, recurrenceEndDate, date } = req.body;

        const transaction = new Transaction({
            user: req.user.id,  // Assuming user ID comes from auth middleware
            type,
            amount,
            category,
            description,
            tags,
            isRecurring,
            recurrencePattern: isRecurring ? recurrencePattern : undefined,
            recurrenceEndDate: isRecurring ? recurrenceEndDate : undefined,
            date
        });

        await transaction.save();
        res.status(201).json({ message: 'Transaction added successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Get all transactions for a specific user
exports.getTransactionById = async (req, res) => {
    try {
        const userId = req.params.id;
        const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this user' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Update a transaction
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction || transaction.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        Object.assign(transaction, req.body); // Update only provided fields
        await transaction.save();

        res.status(200).json({ message: 'Transaction updated successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction || transaction.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.deleteOne();
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
