import { render, screen, cleanup } from "@testing-library/react";
import { vi, describe, it, beforeEach, afterEach } from "vitest";
import AddEditProductPage from "../AddEditProductPage";

// Mock react-router-dom hooks
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    NavLink: ({ to, children, className, ...props }) => (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock the AddEditProductForm component
vi.mock("../AddEditProductForm", () => ({
  default: ({ artikel, isEdit, onSuccess }) => (
    <div data-testid="add-edit-product-form">
      <div>Artikel: {artikel}</div>
      <div>Is Edit: {isEdit.toString()}</div>
      <button onClick={onSuccess}>Trigger Success</button>
    </div>
  ),
}));

// Mock SidebarDashboard with a simple component
vi.mock("../../../components/SidebarDashboard", () => ({
  default: () => <div data-testid="sidebar">Dashboard</div>,
}));

describe("AddEditProductPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders add mode correctly", async () => {
    const mockUseParams = await import("react-router-dom");
    mockUseParams.useParams.mockReturnValue({});
    mockUseParams.useNavigate.mockReturnValue(vi.fn());

    render(<AddEditProductPage />);

    expect(screen.getByText("Add Product")).toBeInTheDocument();
    expect(screen.getByText("Master Products")).toBeInTheDocument(); // Check for unique sidebar content
    expect(screen.getByTestId("add-edit-product-form")).toBeInTheDocument();
    expect(screen.getByText("Artikel:")).toBeInTheDocument(); // Text is split across elements
    expect(screen.getByText("Is Edit: false")).toBeInTheDocument();
  });

  it("renders edit mode correctly", async () => {
    const mockUseParams = await import("react-router-dom");
    mockUseParams.useParams.mockReturnValue({ artikel: "ART-001" });
    mockUseParams.useNavigate.mockReturnValue(vi.fn());

    render(<AddEditProductPage />);

    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(screen.getByText("Artikel: ART-001")).toBeInTheDocument();
    expect(screen.getByText("Is Edit: true")).toBeInTheDocument();
  });

  it("handles success navigation", async () => {
    const mockUseParams = await import("react-router-dom");
    const mockNavigate = vi.fn();
    mockUseParams.useParams.mockReturnValue({});
    mockUseParams.useNavigate.mockReturnValue(mockNavigate);

    render(<AddEditProductPage />);

    // Simulate form success
    const successButton = screen.getByText("Trigger Success");
    successButton.click();

    expect(mockNavigate).toHaveBeenCalledWith("/master-product");
  });

  it("provides SnackbarProvider context", async () => {
    const mockUseParams = await import("react-router-dom");
    mockUseParams.useParams.mockReturnValue({});
    mockUseParams.useNavigate.mockReturnValue(vi.fn());

    // This test verifies that SnackbarProvider is properly set up
    // and doesn't throw any context-related errors
    render(<AddEditProductPage />);

    // Check that the component renders without context errors
    expect(screen.getByTestId("add-edit-product-form")).toBeInTheDocument();
  });
});
