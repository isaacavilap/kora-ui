import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KoraProvider } from "../components/provider";
import { ForgotPasswordScreen, LoginScreen, OtpScreen, ResetPasswordScreen } from "./auth";

const fillLogin = async (email: string, password: string) => {
  if (email) await userEvent.type(screen.getByLabelText("Email"), email);
  if (password) await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
};

describe("AuthLayout brand", () => {
  it("shows the provider brand, and hides it with brand={null}", () => {
    const { rerender } = render(<KoraProvider brand={{ name: "Acme" }}><LoginScreen onSubmit={vi.fn()} /></KoraProvider>);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    rerender(<KoraProvider brand={{ name: "Acme" }}><LoginScreen brand={null} onSubmit={vi.fn()} /></KoraProvider>);
    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
  });
});

describe("LoginScreen", () => {
  it("validates format and does not call onSubmit", async () => {
    const onSubmit = vi.fn();
    render(<LoginScreen onSubmit={onSubmit} />);
    await fillLogin("nope", "");
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values and blocks repeat submits while pending", async () => {
    let finish = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<LoginScreen onSubmit={onSubmit} />);
    await fillLogin("a@b.co ", "secret");
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co", password: "secret" });
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    finish();
  });

  it("on rejection shows a message that does not reveal the account, and clears only the password", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("user a@b.co not found"));
    render(<LoginScreen onSubmit={onSubmit} />);
    await fillLogin("a@b.co", "secret");
    expect(await screen.findByRole("alert")).toHaveTextContent("Those details did not work");
    expect(screen.queryByText(/not found/)).toBeNull();
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("a@b.co");
  });

  it("the error prop replaces the message, and the locale changes the text", () => {
    render(
      <KoraProvider locale="es">
        <LoginScreen onSubmit={() => {}} error="Cuenta bloqueada" />
      </KoraProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Cuenta bloqueada");
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("shows options only when their callback or link is set", () => {
    render(<LoginScreen onSubmit={() => {}} />);
    expect(screen.queryByText("Forgot password?")).toBeNull();
    expect(screen.queryByText("Email me a sign-in link")).toBeNull();
  });
});

describe("other auth screens", () => {
  it("ForgotPasswordScreen confirms without revealing the account", async () => {
    render(<ForgotPasswordScreen onSubmit={() => {}} />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByText(/If that email has an account/)).toBeInTheDocument();
  });

  it("ResetPasswordScreen enforces length and matching", async () => {
    const onSubmit = vi.fn();
    render(<ResetPasswordScreen onSubmit={onSubmit} minPasswordLength={8} />);
    await userEvent.type(screen.getByLabelText("New password"), "short");
    await userEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(screen.getByLabelText("New password")).toHaveAccessibleDescription("Use at least 8 characters.");
    await userEvent.type(screen.getByLabelText("New password"), "enough-now");
    await userEvent.type(screen.getByLabelText("Confirm password"), "different");
    await userEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("OtpScreen keeps digits only, submits at full length, and clears on failure", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("bad"));
    render(<OtpScreen length={4} onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Verification code");
    await userEvent.type(input, "1a2b34");
    expect(onSubmit).toHaveBeenCalledWith({ code: "1234" });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });
});
