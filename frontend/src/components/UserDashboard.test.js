import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
// Try both import styles to see which one works
import UserDashboard from "../UserDashboard";
// If the above doesn't work, try this:
// import { UserDashboard } from "../components/UserDashboard";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn()
}));

// Mock axios manually
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock("axios", () => mockAxios);
jest.spyOn(console, 'error').mockImplementation(() => {});

describe("UserDashboard Component", () => {
  beforeEach(() => {
    // Mock localStorage token
    localStorage.setItem(
      "token",
      JSON.stringify({ id: "user123", exp: Date.now() / 1000 + 3600 })
    );
    
    // Set up mock API response
    mockAxios.get.mockResolvedValue({
      data: [
        { _id: "1", date: "2025-03-21", description: "Salary", amount: 1000, type: "income" },
        { _id: "2", date: "2025-03-20", description: "Groceries", amount: 150, type: "expense" },
      ]
    });
  });

  afterEach(() => {
    localStorage.removeItem("token");
    mockAxios.get.mockReset();
    console.error.mockClear();
  });

  test("renders UserDashboard component correctly", async () => {
    // Check if UserDashboard is defined
    console.log("UserDashboard component:", UserDashboard);
    
    // If UserDashboard is undefined, we need to debug
    if (!UserDashboard) {
      throw new Error("UserDashboard component is undefined. Check the import path and export method.");
    }
    
    render(<UserDashboard />);

    expect(screen.getByText(/Your Personal Finance Tracker/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("$1000.00")).toBeInTheDocument(); // Income
      expect(screen.getByText("-$150.00")).toBeInTheDocument(); // Expense
      expect(screen.getByText("$850.00")).toBeInTheDocument(); // Total balance
    });
    
    expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
  });
});
