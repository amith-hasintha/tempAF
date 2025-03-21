const Budget = require('../models/budget');
const Notification = require('../models/notification');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('User ID:', req.user.id); // Log the user ID

    const { category, amount, month, notifications } = req.body;
    const userId = req.user.id;

    // Create the budget
    const budget = await Budget.create({ userId, category, amount, month, notifications });

    // Create a notification for budget creation
    await Notification.create({
      userId,
      message: `Budget created for ${category} in ${month} with amount $${amount}.`,
      type: 'budget_alert',
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error); // Log the error
    res.status(500).json({ message: 'Error creating budget', error });
  }
};

// Get all budgets for the logged-in user
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets', error });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const { category, amount, month, notifications } = req.body;
    const userId = req.user.id;

    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { category, amount, month, notifications },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Create a notification for budget update
    await Notification.create({
      userId,
      message: `Budget for ${category} in ${month} has been updated to $${amount}.`,
      type: 'budget_alert',
    });

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget', error });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Create a notification for budget deletion
    await Notification.create({
      userId: req.user.id,
      message: `Budget for ${budget.category} in ${budget.month} has been deleted.`,
      type: 'budget_alert',
    });

    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget', error });
  }
};