import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { dayKey, monthWeeks } from "./calendar";
import { ConfirmDialog } from "./overlay";
import { describe, expect, it } from "vitest";
import { Field, Input } from "./form";
import { deltaTone } from "./metrics";
import { pageWindow } from "./navigation";
import { Combobox, filterOptions } from "./pickers";
import { funnelRates, gaugeShare, heatShare, Heatmap, RankedList, segmentShares } from "./widgets";

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

describe("dashboard widgets", () => {
  it("computes funnel rates from the step before", () => {
    expect(funnelRates([{ label: "a", value: 200 }, { label: "b", value: 50 }, { label: "c", value: 0 }, { label: "d", value: 0 }])).toEqual([undefined, 25, 0, undefined]);
  });

  it("keeps gauge and segment shares in range", () => {
    expect(gaugeShare(150, 100)).toBe(1);
    expect(gaugeShare(-5, 100)).toBe(0);
    expect(gaugeShare(5, 0)).toBe(0);
    expect(segmentShares([{ label: "a", value: 1 }, { label: "b", value: 3 }])).toEqual([25, 75]);
    expect(segmentShares([{ label: "a", value: 0 }])).toEqual([0]);
  });

  it("scales heat when all values match", () => {
    expect(heatShare(5, 0, 10)).toBe(0.5);
    expect(heatShare(7, 7, 7)).toBe(1);
  });

  it("shows widget states instead of content", () => {
    const { rerender } = render(<RankedList items={[]} />);
    expect(screen.getByText("No results")).toBeInTheDocument();
    rerender(<RankedList items={[]} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<RankedList items={[]} error="Could not load" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load");
  });

  it("gives screen readers every heatmap value", () => {
    render(<Heatmap caption="Retention" rows={["Oct"]} columns={["M1", "M2"]} values={[[90, null]]} showValues={false} format={(v) => `${v}%`} />);
    expect(screen.getByRole("table", { name: "Retention" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "90%" })).toBeInTheDocument();
  });
});

describe("monthWeeks", () => {
  it("returns whole weeks that cover the month", () => {
    const weeks = monthWeeks(2026, 1, 0); // February 2026 starts on a Sunday and has exactly four weeks.
    expect(weeks).toHaveLength(4);
    expect(dayKey(weeks[0]![0]!)).toBe("2026-02-01");
    expect(dayKey(weeks[3]![6]!)).toBe("2026-02-28");
    const monday = monthWeeks(2026, 1, 1);
    expect(dayKey(monday[0]![0]!)).toBe("2026-01-26");
    expect(monday[0]![0]!.getDay()).toBe(1);
  });
});

describe("ConfirmDialog", () => {
  it("closes on success, and stays open with a message on failure", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<ConfirmDialog open onOpenChange={onOpenChange} title="Delete?" onConfirm={() => Promise.reject(new Error("no"))} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    rerender(<ConfirmDialog open onOpenChange={onOpenChange} title="Delete?" onConfirm={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
