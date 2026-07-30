import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModal } from "./useModal";

describe("useModal", () => {
  it("initializes with closed modal", () => {
    const { result } = renderHook(() => useModal());
    
    expect(result.current.modal.isOpen).toBe(false);
    expect(result.current.modal.title).toBe("");
    expect(result.current.modal.message).toBe("");
    expect(result.current.modal.type).toBe("info");
  });

  it("opens alert modal with showAlert", () => {
    const { result } = renderHook(() => useModal());
    
    act(() => {
      result.current.showAlert("Test Title", "Test Message", "success");
    });
    
    expect(result.current.modal.isOpen).toBe(true);
    expect(result.current.modal.title).toBe("Test Title");
    expect(result.current.modal.message).toBe("Test Message");
    expect(result.current.modal.type).toBe("success");
    expect(result.current.modal.showCancel).toBe(false);
  });

  it("opens confirm modal with showConfirm", () => {
    const { result } = renderHook(() => useModal());
    const onConfirm = vi.fn();
    
    act(() => {
      result.current.showConfirm(
        "Confirm Title",
        "Confirm Message",
        onConfirm,
        "Yes",
        "No"
      );
    });
    
    expect(result.current.modal.isOpen).toBe(true);
    expect(result.current.modal.title).toBe("Confirm Title");
    expect(result.current.modal.message).toBe("Confirm Message");
    expect(result.current.modal.type).toBe("warning");
    expect(result.current.modal.onConfirm).toBe(onConfirm);
    expect(result.current.modal.confirmText).toBe("Yes");
    expect(result.current.modal.cancelText).toBe("No");
    expect(result.current.modal.showCancel).toBe(true);
  });

  it("closes modal with closeModal", () => {
    const { result } = renderHook(() => useModal());
    
    act(() => {
      result.current.showAlert("Test", "Test", "info");
    });
    
    expect(result.current.modal.isOpen).toBe(true);
    
    act(() => {
      result.current.closeModal();
    });
    
    expect(result.current.modal.isOpen).toBe(false);
  });

  it("uses default values for confirm modal", () => {
    const { result } = renderHook(() => useModal());
    const onConfirm = vi.fn();
    
    act(() => {
      result.current.showConfirm("Title", "Message", onConfirm);
    });
    
    expect(result.current.modal.confirmText).toBe("Aceptar");
    expect(result.current.modal.cancelText).toBe("Cancelar");
  });
});
