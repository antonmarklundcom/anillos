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
import {
  SetupForm,
  SETUP_LOGIN_PATH,
  SETUP_WELCOME_PATH,
} from "@/components/setup-form";
import { NewPasswordFields } from "@/components/ui/new-password-fields";
import { PasswordInput } from "@/components/ui/password-input";

const actions = vi.hoisted(() => ({
  loginAdmin: vi.fn(),
  loginAdminAfterSetup: vi.fn(),
  replace: vi.fn(),
  crearUsuario: vi.fn(),
  resetearPassword: vi.fn(),
  registrarCliente: vi.fn(),
  guardarContrasena: vi.fn(),
  entrarCliente: vi.fn(),
}));

vi.mock("@/app/actions/admin-auth", () => ({
  loginAdmin: actions.loginAdmin,
  loginAdminAfterSetup: actions.loginAdminAfterSetup,
}));
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
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: actions.replace,
  }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const PASSWORD = "Prueba-segura-2026";
const MISMATCH = "Otra-segura-2026";
const ERROR = "Las contraseñas no coinciden. Volvé a escribirlas.";

beforeEach(() => {
  vi.clearAllMocks();
  actions.loginAdmin.mockResolvedValue({ ok: false, error: "Login de prueba" });
  actions.loginAdminAfterSetup.mockResolvedValue({ ok: true });
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
  function fillSetup(confirmation = PASSWORD) {
    const secret = screen.getByLabelText("SETUP_SECRET") as HTMLInputElement;
    const password = screen.getByLabelText("Contraseña") as HTMLInputElement;
    const repeated = screen.getByLabelText(
      "Repetí la contraseña"
    ) as HTMLInputElement;
    fireEvent.input(secret, { target: { value: "setup-secret-for-ui-test" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@example.test" },
    });
    fillPasswords("Contraseña", confirmation);
    return { form: password.form!, secret, password, repeated };
  }

  function mockSetup(
    body: unknown = { ok: true, pasos: { duenio: "creado" } },
    ok = true
  ) {
    const fetch = vi.fn().mockResolvedValue({ ok, json: async () => body });
    vi.stubGlobal("fetch", fetch);
    return fetch;
  }

  it("blocks mismatches and clears secrets before normal authentication, then opens the welcome page", async () => {
    const fetch = mockSetup();
    render(<SetupForm />);
    const fields = fillSetup(MISMATCH);
    fireEvent.submit(fields.form);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(ERROR);
    fillPasswords("Contraseña");
    fireEvent.click(
      screen.getAllByRole("button", { name: "Mostrar contraseña" })[0]!
    );
    actions.loginAdminAfterSetup.mockImplementation(async () => {
      expect(fields.secret.value).toBe("");
      expect(fields.password.value).toBe("");
      expect(fields.repeated.value).toBe("");
      return { ok: true };
    });
    fireEvent.submit(fields.form);
    await waitFor(() =>
      expect(actions.replace).toHaveBeenCalledWith(SETUP_WELCOME_PATH)
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
    const credentials = actions.loginAdminAfterSetup.mock
      .calls[0]![0] as FormData;
    expect(Array.from(credentials.entries())).toEqual([
      ["email", "owner@example.test"],
      ["password", PASSWORD],
    ]);
    expect(screen.queryByLabelText("SETUP_SECRET")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Repetí la contraseña")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Cargar el catálogo de ejemplo/)
    ).not.toBeInTheDocument();
  });

  it("requires owner details rather than silently doing migrations only", () => {
    const fetch = mockSetup();
    render(<SetupForm />);
    for (const label of ["Email", "Contraseña", "Repetí la contraseña"])
      expect(screen.getByLabelText(label)).toBeRequired();
    fireEvent.submit(screen.getByLabelText("SETUP_SECRET").closest("form")!);
    expect(fetch).not.toHaveBeenCalled();
    expect(actions.loginAdminAfterSetup).not.toHaveBeenCalled();
  });

  it("can show and hide the setup key separately without submitting", () => {
    const fetch = mockSetup();
    render(<SetupForm />);
    const { secret } = fillSetup();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar secreto" }));
    expect(secret.type).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar secreto" }));
    expect(secret.type).toBe("password");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("authenticates an intentionally updated owner and never requests demo seeding", async () => {
    const fetch = mockSetup({ ok: true, pasos: { duenio: "actualizado" } });
    render(<SetupForm />);
    const { form } = fillSetup();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(form);
    await waitFor(() =>
      expect(actions.replace).toHaveBeenCalledWith(SETUP_WELCOME_PATH)
    );
    expect(JSON.parse(fetch.mock.calls[0]![1].body)).toMatchObject({
      seed: false,
      force: true,
    });
  });

  it.each([
    { ok: false, body: { error: "unauthorized" } },
    { ok: false, body: { ok: true, pasos: { duenio: "creado" } } },
    {
      ok: true,
      body: {
        ok: true,
        pasos: { migraciones: "aplicadas", duenio: "no pedido" },
      },
    },
    { ok: true, body: { pasos: { duenio: "creado" } } },
    { ok: true, body: {} },
  ])(
    "never signs in after a rejected or unconfirmed setup ($body)",
    async ({ ok, body }) => {
      const fetch = mockSetup(body, ok);
      render(<SetupForm />);
      fireEvent.submit(fillSetup().form);
      await waitFor(() =>
        expect(screen.getByRole("status")).toBeInTheDocument()
      );
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(actions.loginAdminAfterSetup).not.toHaveBeenCalled();
      expect(actions.replace).not.toHaveBeenCalled();
      expect(screen.getByLabelText("SETUP_SECRET")).toBeInTheDocument();
    }
  );

  it.each(["rejected", "transport"])(
    "preserves account success and offers login if sign-in has a %s failure",
    async (failure) => {
      mockSetup({
        ok: true,
        pasos: { duenio: "creado" },
        preflight: {
          checks: [
            {
              id: "pagopar",
              severity: "advierte",
              title: "Pagopar",
              detail: "Servicio opcional",
            },
          ],
          blocking: 0,
          warnings: 1,
        },
      });
      if (failure === "transport")
        actions.loginAdminAfterSetup.mockRejectedValueOnce(
          new Error("offline")
        );
      else
        actions.loginAdminAfterSetup.mockResolvedValueOnce({
          ok: false,
          error: "Login no disponible",
        });
      render(<SetupForm />);
      fireEvent.submit(fillSetup().form);
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
          /ingreso automático no se completó/
        )
      );
      expect(
        screen.getByRole("heading", { name: "Tu acceso al panel está listo" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Entrar al panel" })
      ).toHaveAttribute("href", SETUP_LOGIN_PATH);
      expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
      expect(actions.replace).not.toHaveBeenCalled();
      const details = screen
        .getByText("Ver detalles técnicos")
        .closest("details")!;
      expect(details).not.toHaveAttribute("open");
      expect(SETUP_LOGIN_PATH).not.toContain("owner@example.test");
      expect(SETUP_LOGIN_PATH).not.toContain(PASSWORD);
    }
  );
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
