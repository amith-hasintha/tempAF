import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import UserHome from "../UserHome";

jest.mock("axios");

describe("UserHome Component", () => {
  beforeEach(() => {
    // Mock localStorage token
    localStorage.setItem(
      "token",
      JSON.stringify({ id: "user123", exp: Date.now() / 1000 + 3600 })
    );
  });

  afterEach(() => {
    localStorage.removeItem("token");
  });

  test("renders UserHome component correctly", async () => {
    // Mock API response
    axios.get.mockResolvedValue({
      data: [
        { _id: "1", date: "2025-03-21", description: "Salary", amount: 1000, type: "income" },
        { _id: "2", date: "2025-03-20", description: "Groceries", amount: 150, type: "expense" },
      ],
    });

    render(<UserHome />);

    expect(screen.getByText(/Your Personal Finance Tracker/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("$1000.00")).toBeInTheDocument(); // Income
      expect(screen.getByText("-$150.00")).toBeInTheDocument(); // Expense
      expect(screen.getByText("$850.00")).toBeInTheDocument(); // Total balance
    });

    expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
  });

  test("displays error message when API call fails", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    render(<UserHome />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
