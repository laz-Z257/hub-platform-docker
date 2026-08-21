import { describe, expect, it, vi } from "vitest";
import { csrfProtection } from "./csrf";

function request(path: string, method = "POST", headers: Record<string, string> = {}) {
  return { path, method, headers, cookies: {} } as any;
}

describe("csrfProtection", () => {
  it("only exempts login, registration and refresh", () => {
    const next = vi.fn();

    csrfProtection(request("/api/auth/login"), {} as any, next);
    csrfProtection(request("/api/auth/register"), {} as any, next);
    csrfProtection(request("/api/auth/refresh"), {} as any, next);
    expect(next).toHaveBeenCalledTimes(3);
  });

  it("requires CSRF for other state-changing routes", () => {
    const next = vi.fn();
    const json = vi.fn();
    const response = { status: vi.fn().mockReturnValue({ json }) } as any;

    csrfProtection(request("/api/incidents/mark-seen"), response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
