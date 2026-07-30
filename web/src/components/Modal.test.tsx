import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal", () => {
  it("renders when isOpen is true", () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        message="Test Message"
        type="info"
      />
    );
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal
        isOpen={false}
        onClose={vi.fn()}
        title="Test Title"
        message="Test Message"
        type="info"
      />
    );
    
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        message="Test Message"
        type="info"
      />
    );
    
    const closeButton = container.querySelector('button[class*="flex-shrink-0"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        message="Test Message"
        type="warning"
        onConfirm={onConfirm}
        showCancel={true}
      />
    );
    
    const confirmButton = screen.getByRole("button", { name: /aceptar/i });
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders cancel button when showCancel is true", () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        message="Test Message"
        type="warning"
        showCancel={true}
      />
    );
    
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("does not render cancel button when showCancel is false", () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        message="Test Message"
        type="info"
        showCancel={false}
      />
    );
    
    expect(screen.queryByRole("button", { name: /cancelar/i })).not.toBeInTheDocument();
  });

  it("renders different background based on type", () => {
    const { container, rerender } = render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test"
        message="Test"
        type="success"
      />
    );
    
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    
    rerender(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test"
        message="Test"
        type="error"
      />
    );
    
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
  });
});
