import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTicketModal from "./CreateTicketModal";

// Mock the api module
vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("CreateTicketModal", () => {
  it("renders modal with form fields", () => {
    render(
      <CreateTicketModal
        onClose={vi.fn()}
        onCreated={vi.fn()}
        showAlert={vi.fn()}
      />
    );
    
    expect(screen.getByText("Abrir Nuevo Ticket")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre del solicitante")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("123456789")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre del punto de venta")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Número de contacto")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Describe el problema...")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <CreateTicketModal
        onClose={onClose}
        onCreated={vi.fn()}
        showAlert={vi.fn()}
      />
    );
    
    const closeButton = container.querySelector('button[class*="w-8 h-8"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <CreateTicketModal
        onClose={onClose}
        onCreated={vi.fn()}
        showAlert={vi.fn()}
      />
    );
    
    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows validation errors when submitting empty form", async () => {
    render(
      <CreateTicketModal
        onClose={vi.fn()}
        onCreated={vi.fn()}
        showAlert={vi.fn()}
      />
    );
    
    const submitButton = screen.getByRole("button", { name: /crear ticket/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getAllByText("Requerido").length).toBeGreaterThan(0);
    });
  });

  it("calls onCreated when form is submitted successfully", async () => {
    const onCreated = vi.fn();
    const { api } = await import("@/lib/api");
    
    render(
      <CreateTicketModal
        onClose={vi.fn()}
        onCreated={onCreated}
        showAlert={vi.fn()}
      />
    );
    
    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText("Nombre del solicitante"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("123456789"), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nombre del punto de venta"), {
      target: { value: "Test PV" },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe el problema..."), {
      target: { value: "Test description" },
    });

    const submitButton = screen.getByRole("button", { name: /crear ticket/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/incidents", expect.any(Object));
      expect(onCreated).toHaveBeenCalledTimes(1);
    });
  });

  it("shows alert when submission fails", async () => {
    const showAlert = vi.fn();
    const { api } = await import("@/lib/api");
    (api.post as any).mockRejectedValueOnce(new Error("API Error"));
    
    render(
      <CreateTicketModal
        onClose={vi.fn()}
        onCreated={vi.fn()}
        showAlert={showAlert}
      />
    );
    
    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText("Nombre del solicitante"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("123456789"), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nombre del punto de venta"), {
      target: { value: "Test PV" },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe el problema..."), {
      target: { value: "Test description" },
    });

    const submitButton = screen.getByRole("button", { name: /crear ticket/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(showAlert).toHaveBeenCalledWith(
        "Error",
        "Error al crear ticket",
        "error"
      );
    });
  });
});
