import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorScreen, MembersScreen, OnboardingWizard } from "./screens";

const steps = (validate?: () => boolean) => [
  { title: "One", content: <p>first</p>, validate },
  { title: "Two", content: <p>second</p>, optional: true },
  { title: "Three", content: <p>third</p> },
];

describe("OnboardingWizard", () => {
  it("moves through steps, reports each, and completes", async () => {
    const onStepChange = vi.fn();
    const onComplete = vi.fn();
    render(<OnboardingWizard steps={steps()} onStepChange={onStepChange} onComplete={onComplete} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    await userEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("stays on the step when validation fails, and resumes from initialStep", async () => {
    render(<OnboardingWizard steps={steps(() => false)} onComplete={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("first")).toBeInTheDocument();
  });

  it("clamps an out-of-range initialStep", () => {
    render(<OnboardingWizard steps={steps()} initialStep={9} onComplete={() => {}} />);
    expect(screen.getByText("third")).toBeInTheDocument();
  });
});

describe("MembersScreen", () => {
  const members = [
    { id: "1", name: "Ana Ruiz", email: "ana@x.co", role: "admin" },
    { id: "2", name: "Leo Paz", email: "leo@x.co", role: "viewer", status: "invited" as const },
  ];
  const roles = [{ value: "admin", label: "Admin" }, { value: "viewer", label: "Viewer" }];

  it("hides management controls without canManage", () => {
    render(<MembersScreen members={members} roles={roles} onInvite={() => {}} onRemove={() => {}} />);
    expect(screen.queryByRole("button", { name: "Invite member" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Actions" })).toBeNull();
  });

  it("validates the invite email before calling onInvite", async () => {
    const onInvite = vi.fn();
    render(<MembersScreen members={members} roles={roles} canManage onInvite={onInvite} />);
    await userEvent.click(screen.getByRole("button", { name: "Invite member" }));
    await userEvent.type(screen.getByLabelText("Email"), "bad");
    await userEvent.click(screen.getByRole("button", { name: "Send invitation" }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onInvite).not.toHaveBeenCalled();
  });
});

describe("ErrorScreen", () => {
  it("renders the text for each variant", () => {
    render(<ErrorScreen variant={404} homeHref="/" />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to start" })).toHaveAttribute("href", "/");
  });
});
