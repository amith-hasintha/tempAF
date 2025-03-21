const Report = require('../models/report');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, userId: req.user.id });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error });
  }
};

// Get all reports for the logged-in user
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error });
  }
};