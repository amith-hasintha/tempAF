import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as router from "react-router-dom";
import AdminSidebar from "../AdminSidebar";

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("AdminSidebar Component", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        removeItem: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders AdminSidebar component correctly", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  test("displays all navigation links with correct paths", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Check all links exist with correct text and href attributes
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/adminhome");
    
    const usersLink = screen.getByText("Manage Users").closest("a");
    expect(usersLink).toHaveAttribute("href", "/admin-user-management");
    
    const transactionsLink = screen.getByText("Oversee Transactions").closest("a");
    expect(transactionsLink).toHaveAttribute("href", "/all-transactions");
    
    const categoriesLink = screen.getByText("Manage Categories").closest("a");
    expect(categoriesLink).toHaveAttribute("href", "/category-management");
    
    const reportsLink = screen.getByText("Reports").closest("a");
    expect(reportsLink).toHaveAttribute("href", "/admin/reports");
  });

  test("logout button removes token and navigates to login page", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);
    
    // Check if localStorage.removeItem was called with "token"
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    
    // Check if navigate was called with "/login"
    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });

  test("renders all icons correctly", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Check that the component renders without errors
    // We can't directly test for the icons, but we can ensure the links containing them render
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(screen.getByText("Oversee Transactions")).toBeInTheDocument();
    expect(screen.getByText("Manage Categories")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("sidebar has the correct CSS class", () => {
    const { container } = render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    const sidebarElement = container.querySelector(".admin-sidebar");
    expect(sidebarElement).toBeInTheDocument();
  });
});
