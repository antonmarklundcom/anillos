import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/admin/login-form";
import { UsersManager } from "@/components/admin/users-manager";
import { CustomerLoginForm } from "@/components/cuenta/login-form";
import { CustomerPasswordForm } from "@/components/cuenta/password-form";
import { CustomerRegisterForm } from "@/components/cuenta/register-form";
import { SetupForm } from "@/components/setup-form";
import { NewPasswordFields } from "@/components/ui/new-password-fields";
import { PasswordInput } from "@/components/ui/password-input";

const actions = vi.hoisted(() => ({
  loginAdmin: vi.fn(),
  crearUsuario: vi.fn(),
  resetearPassword: vi.fn(),
  registrarCliente: vi.fn(),
  guardarContrasena: vi.fn(),
  entrarCliente: vi.fn(),
}));

vi.mock("@/app/actions/admin-auth", () => ({ loginAdmin: actions.loginAdmin }));
vi.mock("@/app/actions/admin-users", () => ({
  crearUsuario: actions.crearUsuario,
  resetearPassword: actions.resetearPassword,
  cambiarEstadoUsuario: vi.fn(),
  cambiarRolUsuario: vi.fn(),
}));
vi.mock("@/app/actions/cuenta", () => ({
  registrarCliente: actions.registrarCliente,
  guardarContrasena: actions.guardarContrasena,
  entrarCliente: actions.entrarCliente,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const PASSWORD = "Prueba-segura-2026";
const MISMATCH = "Otra-segura-2026";
const ERROR = "Las contraseñas no coinciden. Volvé a escribirlas.";

beforeEach(() => {
  vi.clearAllMocks();
  actions.loginAdmin.mockResolvedValue({ ok: false, error: "Login de prueba" });
  for (const action of [
    actions.crearUsuario,
    actions.resetearPassword,
    actions.registrarCliente,
    actions.guardarContrasena,
    actions.entrarCliente,
  ]) {
    action.mockResolvedValue({ ok: true });
  }
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function fillPasswords(passwordLabel: string, confirmation = PASSWORD) {
  fireEvent.input(screen.getByLabelText(passwordLabel), {
    target: { value: PASSWORD },
  });
  fireEvent.input(screen.getByLabelText("Repetí la contraseña"), {
    target: { value: confirmation },
  });
}

describe("password fields", () => {
  it("toggles visibility without changing the value or submitting, and hides on reset", () => {
    const submit = vi.fn();
    render(
      <form onSubmit={submit}>
        <label htmlFor="pass">Contraseña</label>
        <PasswordInput id="pass" name="password" />
      </form>
    );
    const field = screen.getByLabelText("Contraseña") as HTMLInputElement;
    fireEvent.input(field, { target: { value: PASSWORD } });
    expect(field.type).toBe("password");
    const show = screen.getByRole("button", { name: "Mostrar contraseña" });
    expect(show).toHaveAttribute("aria-controls", "pass");
    fireEvent.click(show);
    expect(field.type).toBe("text");
    expect(field.value).toBe(PASSWORD);
    expect(submit).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Ocultar contraseña" })
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.reset(field.form!);
    expect(field.type).toBe("password");
  });

  it("requires confirmation and revalidates when either password changes", () => {
    render(
      <form>
        <NewPasswordFields id="pass" label="Nueva contraseña" />
      </form>
    );
    const password = screen.getByLabelText(
      "Nueva contraseña"
    ) as HTMLInputElement;
    const confirmation = screen.getByLabelText(
      "Repetí la contraseña"
    ) as HTMLInputElement;
    expect(confirmation.checkValidity()).toBe(false);
    fillPasswords("Nueva contraseña", MISMATCH);
    expect(confirmation.validationMessage).toBe(ERROR);
    fireEvent.input(confirmation, { target: { value: PASSWORD } });
    expect(confirmation.checkValidity()).toBe(true);
    fireEvent.input(password, { target: { value: MISMATCH } });
    expect(confirmation.validationMessage).toBe(ERROR);
    fireEvent.input(confirmation, { target: { value: MISMATCH } });
    expect(confirmation.checkValidity()).toBe(true);
    fireEvent.reset(password.form!);
    expect(confirmation.validity.customError).toBe(false);
  });
});

describe("setup", () => {
  it("blocks mismatches and sends only the chosen password; clears secrets and links to login after success", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ pasos: { duenio: "creado" } }),
      });
    vi.stubGlobal("fetch", fetch);
    render(<SetupForm />);
    fireEvent.input(screen.getByLabelText("SETUP_SECRET"), {
      target: { value: "setup-secret-for-ui-test" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@example.test" },
    });
    fillPasswords("Contraseña", MISMATCH);
    const form = screen.getByLabelText("Contraseña").closest("form")!;
    fireEvent.submit(form);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(ERROR);
    fillPasswords("Contraseña");
    fireEvent.click(
      screen.getAllByRole("button", { name: "Mostrar contraseña" })[0]!
    );
    fireEvent.submit(form);
    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "Entrar al panel" })
      ).toHaveAttribute("href", "/admin/login")
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("/api/setup/init");
    expect(init.headers.authorization).toBe("Bearer setup-secret-for-ui-test");
    expect(JSON.parse(init.body)).toEqual({
      seed: false,
      force: false,
      owner: { email: "owner@example.test", password: PASSWORD },
    });
    expect(screen.getByLabelText("SETUP_SECRET")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "type",
      "password"
    );
    expect(screen.getByLabelText("Repetí la contraseña")).toHaveValue("");
  });

  it("still allows migrations without requesting an owner", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetch);
    render(<SetupForm />);
    expect(screen.getByLabelText("Contraseña")).not.toBeRequired();
    expect(screen.getByLabelText("Repetí la contraseña")).not.toBeRequired();
    fireEvent.submit(screen.getByLabelText("SETUP_SECRET").closest("form")!);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetch.mock.calls[0]![1].body)).toEqual({
      seed: false,
      force: false,
    });
  });
});

describe("admin accounts", () => {
  const users = [
    {
      id: 2,
      email: "staff@example.test",
      name: null,
      role: "staff" as const,
      isActive: true,
      lastLogin: null,
    },
  ];

  it("requires a matching repeated password when creating a user", async () => {
    render(<UsersManager users={[]} actingUserId={1} />);
    fireEvent.click(screen.getByRole("button", { name: /agregar usuario/i }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@example.test" },
    });
    fillPasswords("Contraseña temporal", MISMATCH);
    const form = screen.getByLabelText("Contraseña temporal").closest("form")!;
    fireEvent.submit(form);
    expect(actions.crearUsuario).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(ERROR);
    fillPasswords("Contraseña temporal");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(actions.crearUsuario).toHaveBeenCalledWith({
        email: "new@example.test",
        name: "",
        password: PASSWORD,
        role: "staff",
      })
    );
  });

  it("masks admin resets and blocks a mismatched or empty confirmation", async () => {
    render(<UsersManager users={users} actingUserId={1} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Resetear contraseña" })
    );
    expect(
      screen.getByLabelText("Contraseña nueva para staff@example.test")
    ).toHaveAttribute("type", "password");
    fillPasswords("Contraseña nueva para staff@example.test", "");
    const form = screen
      .getByLabelText("Contraseña nueva para staff@example.test")
      .closest("form")!;
    fireEvent.submit(form);
    expect(actions.resetearPassword).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(ERROR);
    fillPasswords("Contraseña nueva para staff@example.test");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(actions.resetearPassword).toHaveBeenCalledWith({
        userId: 2,
        password: PASSWORD,
      })
    );
  });
});

describe("optional customer accounts", () => {
  it.each([
    {
      component: <CustomerRegisterForm />,
      label: "Contraseña",
      action: actions.registrarCliente,
    },
    {
      component: <CustomerPasswordForm required={false} />,
      label: "Nueva contraseña",
      action: actions.guardarContrasena,
    },
  ])(
    "blocks mismatches before writing an account password ($label)",
    async ({ component, label, action }) => {
      render(component);
      fillPasswords(label, MISMATCH);
      const form = screen.getByLabelText(label).closest("form")!;
      fireEvent.submit(form);
      expect(action).not.toHaveBeenCalled();
      expect(screen.getByText(ERROR)).toBeInTheDocument();
      fillPasswords(label);
      fireEvent.submit(form);
      await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
      expect(action.mock.calls[0]![0].password).toBe(PASSWORD);
      expect(action.mock.calls[0]![0]).not.toHaveProperty(
        "passwordConfirmation"
      );
    }
  );
});

describe("login", () => {
  it.each([
    {
      component: <LoginForm next="/admin/usuarios" />,
      action: actions.loginAdmin,
    },
    { component: <CustomerLoginForm />, action: actions.entrarCliente },
  ])(
    "allows visibility without requiring a repeated login password",
    async ({ component, action }) => {
      render(component);
      const field = screen.getByLabelText("Contraseña");
      fireEvent.input(field, { target: { value: PASSWORD } });
      fireEvent.click(
        screen.getByRole("button", { name: "Mostrar contraseña" })
      );
      expect(field).toHaveAttribute("type", "text");
      expect(
        screen.queryByLabelText("Repetí la contraseña")
      ).not.toBeInTheDocument();
      fireEvent.submit(field.closest("form")!);
      await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
      const input = action.mock.calls[0]![0];
      expect(
        input instanceof FormData ? input.get("password") : input.password
      ).toBe(PASSWORD);
    }
  );
});
