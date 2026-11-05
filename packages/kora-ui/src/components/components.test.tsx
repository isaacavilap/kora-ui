import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, Input } from "./form";
import { deltaTone } from "./metrics";
import { pageWindow } from "./navigation";
import { Combobox, filterOptions } from "./pickers";

describe("pageWindow", () => {
  it("keeps first, last, and neighbors, and marks gaps", () => {
    expect(pageWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });
});

describe("deltaTone", () => {
  it("respects inverted metrics", () => {
    expect(deltaTone(5)).toBe("good");
    expect(deltaTone(5, true)).toBe("bad");
    expect(deltaTone(-5, true)).toBe("good");
    expect(deltaTone(0)).toBe("neutral");
  });
});

describe("filterOptions", () => {
  it("matches without case", () => {
    expect(filterOptions([{ value: "a", label: "Panamá" }, { value: "b", label: "Perú" }], "PAN")).toEqual([{ value: "a", label: "Panamá" }]);
  });
});

describe("Field", () => {
  it("links label, error, and invalid state to the control", () => {
    render(
      <Field label="Name" error="Required">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
  });

  it("labels pickers whose control is a button", () => {
    render(
      <Field label="Country">
        <Combobox options={[]} onChange={() => {}} />
      </Field>,
    );
    expect(screen.getByLabelText("Country")).toHaveAttribute("role", "combobox");
  });
});
