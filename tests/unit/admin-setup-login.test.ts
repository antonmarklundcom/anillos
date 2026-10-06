import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  authenticate: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  session: {
    userId: undefined as number | undefined,
    email: undefined as string | undefined,
    role: undefined as string | undefined,
    sessionVersion: undefined as number | undefined,
    save: vi.fn(),
  },
  getSession: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ authenticate: mocks.authenticate }));
vi.mock("@/lib/session", () => ({ getSession: mocks.getSession }));
vi.mock("@/i18n", () => ({
  t: (key: string) => key,
  tPlural: (key: string, count: number) => `${key}:${count}`,
}));

import { loginAdmin, loginAdminAfterSetup } from "@/app/actions/admin-auth";
import { LOGIN_LIMIT, resetRateLimits } from "@/lib/rate-limit";

function credentials(next = "/admin/bienvenida", email = "owner@example.test") {
  const data = new FormData();
  data.set("email", email);
  data.set("password", "Synthetic-test-password-2026");
  data.set("next", next);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
  mocks.headers.mockResolvedValue(
    new Headers({ "x-forwarded-for": "198.51.100.23" })
  );
  mocks.authenticate.mockResolvedValue(null);
  mocks.getSession.mockResolvedValue(mocks.session);
  mocks.session.save.mockResolvedValue(undefined);
  mocks.session.userId = undefined;
  mocks.session.email = undefined;
  mocks.session.role = undefined;
  mocks.session.sessionVersion = undefined;
});

describe.each([
  { name: "normal login", action: loginAdmin },
  { name: "setup handoff", action: loginAdminAfterSetup },
])("$name security", ({ name, action }) => {
  it("rejects malformed input before authentication or session creation", async () => {
    expect(await action(new FormData())).toEqual({
      ok: false,
      error: "adminError.login.generico",
    });
    expect(mocks.authenticate).not.toHaveBeenCalled();
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("uses the same generic failure for rejected credentials without creating a session", async () => {
    expect(await action(credentials())).toEqual({
      ok: false,
      error: "adminError.login.generico",
    });
    expect(mocks.authenticate).toHaveBeenCalledWith(
      "owner@example.test",
      "Synthetic-test-password-2026"
    );
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.session.save).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("saves the authenticated identity and current session version before reporting success", async () => {
    mocks.authenticate.mockResolvedValue({
      id: 42,
      email: "owner@example.test",
      role: "owner",
      name: null,
      sessionVersion: 7,
    });
    if (name === "normal login") {
      await expect(action(credentials())).rejects.toThrow(
        "NEXT_REDIRECT:/admin/bienvenida"
      );
      expect(mocks.redirect).toHaveBeenCalledWith("/admin/bienvenida");
    } else {
      expect(await action(credentials())).toEqual({ ok: true });
      expect(mocks.redirect).not.toHaveBeenCalled();
    }
    expect(mocks.session).toMatchObject({
      userId: 42,
      email: "owner@example.test",
      role: "owner",
      sessionVersion: 7,
    });
    expect(mocks.session.save).toHaveBeenCalledTimes(1);
    if (name === "normal login")
      expect(mocks.session.save.mock.invocationCallOrder[0]).toBeLessThan(
        mocks.redirect.mock.invocationCallOrder[0]!
      );
  });

  it("does not report success or redirect if persisting the session fails", async () => {
    mocks.authenticate.mockResolvedValue({
      id: 42,
      email: "owner@example.test",
      role: "owner",
      sessionVersion: 7,
    });
    mocks.session.save.mockRejectedValue(
      new Error("Synthetic session persistence failure")
    );
    await expect(action(credentials())).rejects.toThrow(
      "Synthetic session persistence failure"
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

it("shares the IP attempt budget across both publicly callable login entry points", async () => {
  for (let attempt = 0; attempt < LOGIN_LIMIT; attempt++) {
    const action = attempt % 2 ? loginAdmin : loginAdminAfterSetup;
    await action(credentials("/admin", `user-${attempt}@example.test`));
  }
  for (const action of [loginAdminAfterSetup, loginAdmin]) {
    expect(await action(credentials())).toMatchObject({
      ok: false,
      error: expect.stringContaining("adminError.login.demasiados"),
    });
  }
  expect(mocks.authenticate).toHaveBeenCalledTimes(LOGIN_LIMIT);
  expect(mocks.getSession).not.toHaveBeenCalled();
  expect(mocks.redirect).not.toHaveBeenCalled();
});

it("shares the normalized email attempt budget across both entry points even when IPs change", async () => {
  for (let attempt = 0; attempt < LOGIN_LIMIT; attempt++) {
    mocks.headers.mockResolvedValue(
      new Headers({ "x-forwarded-for": `198.51.100.${attempt + 1}` })
    );
    const action = attempt % 2 ? loginAdmin : loginAdminAfterSetup;
    await action(
      credentials(
        "/admin",
        attempt % 2 ? "OWNER@example.test" : " owner@example.test "
      )
    );
  }
  mocks.headers.mockResolvedValue(
    new Headers({ "x-forwarded-for": "198.51.100.200" })
  );
  expect(await loginAdminAfterSetup(credentials())).toMatchObject({
    ok: false,
    error: expect.stringContaining("adminError.login.demasiados"),
  });
  expect(mocks.authenticate).toHaveBeenCalledTimes(LOGIN_LIMIT);
  expect(mocks.getSession).not.toHaveBeenCalled();
});

it("keeps the normal login redirect constrained to an internal admin path", async () => {
  mocks.authenticate.mockResolvedValue({
    id: 42,
    email: "owner@example.test",
    role: "owner",
    sessionVersion: 7,
  });
  await expect(
    loginAdmin(credentials("https://external.example.test/"))
  ).rejects.toThrow("NEXT_REDIRECT:/admin");
  expect(mocks.redirect).toHaveBeenCalledWith("/admin");
});
