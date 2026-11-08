import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { dayKey, EventCalendar, monthWeeks, parseTime, placeEvents, shiftDate, weekDays } from "./calendar";
import { avatarCode, avatarFromSeed, GeneratedAvatar, parseAvatarCode, randomAvatar } from "./generated-avatar";
import { FileName, splitFileName } from "./display";
import { compressImage, fitSize } from "./image-input";
import { clipText, shareBreadcrumb, shareDomain, SharePreview, xCardLayout } from "./share-preview";
import { ConfirmDialog } from "./overlay";
import { afterEach, describe, expect, it } from "vitest";
import { Kanban } from "./widgets";
import { Field, Input, Select } from "./form";
import { deltaTone, Progress, progressGradient, rangeTone } from "./metrics";
import { pageWindow } from "./navigation";
import { Combobox, filterOptions } from "./pickers";
import { funnelRates, gaugeShare, heatShare, Heatmap, RankedList, segmentShares } from "./widgets";

describe("Combobox with several", () => {
  const options = [{ value: "a", label: "Uno" }, { value: "b", label: "Dos" }, { value: "c", label: "Tres" }];

  it("stays open, adds and removes, and keeps the order of the options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox multiple options={options} value={["c"]} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Uno" }));
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(screen.getByRole("listbox")).toBeTruthy();
    await user.click(screen.getByRole("option", { name: "Tres" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("says what is chosen, and goes with a form", () => {
    const { container } = render(<Combobox multiple name="branches" options={options} value={["a", "b"]} onChange={() => {}} />);
    expect(screen.getByRole("combobox").textContent).toContain("Uno, Dos");
    expect([...container.querySelectorAll<HTMLInputElement>('input[name="branches"]')].map((input) => input.value)).toEqual(["a", "b"]);
  });
});

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

describe("GeneratedAvatar", () => {
  it("gives the same avatar for the same seed, and varies between seeds", () => {
    expect(avatarFromSeed("user-123")).toEqual(avatarFromSeed("user-123"));
    expect(new Set("abcdefgh".split("").map((s) => avatarCode(avatarFromSeed(s)))).size).toBeGreaterThan(1);
  });

  it("reads back a saved code, and rejects a broken one", () => {
    for (let i = 0; i < 20; i++) {
      const art = randomAvatar();
      expect(parseAvatarCode(avatarCode(art))).toEqual(art);
    }
    for (const bad of ["", "https://x/y.png", "abs:10-0-0", "abs:1-8-0", "abs:1-1-6", "abs:1-1", null, undefined]) expect(parseAvatarCode(bad)).toBeNull();
  });

  it("draws every shape, with a name only when it has a label", () => {
    const { container } = render(<>{Array.from({ length: 10 }, (_, shape) => <GeneratedAvatar key={shape} art={{ shape, color: 0, face: shape % 6 }} />)}</>);
    expect(container.querySelectorAll("svg")).toHaveLength(10);
    expect(new Set([...container.querySelectorAll("clipPath")].map((c) => c.id)).size).toBe(10);
    render(<GeneratedAvatar seed="a" label="Ana" />);
    expect(screen.getByRole("img", { name: "Ana" })).toBeInTheDocument();
  });
});

describe("EventCalendar people", () => {
  const people = [{ id: "ana", name: "Ana" }, { id: "tom", name: "Tom", avatar: "/tom.png" }];
  const date = "2026-11-05";
  const events = [
    { id: "1", title: "Ana visit", date, time: "09:00", personId: "ana" },
    { id: "2", title: "Tom visit", date, time: "09:00", personId: "tom" },
    { id: "3", title: "Open job", date, time: "10:00" },
    { id: "4", title: "Gone person", date, time: "11:00", personId: "left" },
  ];

  it("gives each person a column with their events, in the day view", () => {
    render(<EventCalendar events={events} people={people} defaultDate={new Date(2026, 10, 5)} defaultView="day" />);
    expect(screen.getByRole("img", { name: "Ana" })).toBeInTheDocument();
    const column = (title: string) => screen.getByRole("button", { name: new RegExp(title) }).parentElement!;
    expect(column("Ana visit")).not.toBe(column("Tom visit"));
    expect(screen.getByRole("button", { name: /Ana visit/ }).style.width).toBe("100%");
  });

  it("keeps events with no known person in their own column", () => {
    render(<EventCalendar events={events} people={people} defaultDate={new Date(2026, 10, 5)} defaultView="day" />);
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    const column = screen.getByRole("button", { name: /Open job/ }).parentElement!;
    expect(column).toBe(screen.getByRole("button", { name: /Gone person/ }).parentElement);
  });

  it("has no unassigned column when every event has a person", () => {
    render(<EventCalendar events={events.slice(0, 2)} people={people} defaultDate={new Date(2026, 10, 5)} defaultView="day" />);
    expect(screen.queryByText("Unassigned")).toBeNull();
  });
});

describe("FileName", () => {
  it("keeps the extension apart from the name", () => {
    expect(splitFileName("report.final.pdf")).toEqual({ base: "report.final", extension: ".pdf" });
    expect(splitFileName("README")).toEqual({ base: "README", extension: "" });
    expect(splitFileName(".env")).toEqual({ base: ".env", extension: "" });
    expect(splitFileName("notes.this-is-not-an-extension")).toEqual({ base: "notes.this-is-not-an-extension", extension: "" });
  });

  it("gives the whole name on hover", () => {
    const { container } = render(<FileName name="report.pdf" />);
    expect(container.firstElementChild!.getAttribute("title")).toBe("report.pdf");
    expect(container.textContent).toBe("report.pdf");
  });
});

describe("compressImage", () => {
  const photo = (type = "image/png", size = 1000) => new File([new Uint8Array(size)], "holiday.photo.png", { type });

  function stubBrowser(width: number, outputs: Record<string, number | "png">) {
    const close = vi.fn();
    vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width, height: width / 2, close })));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ clearRect() {}, fillRect() {}, drawImage() {}, fillStyle: "" } as never);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((done, type) => {
      const output = outputs[type!];
      // Safari returns a PNG when it cannot write the requested format.
      done(output === "png" ? new Blob([new Uint8Array(5000)], { type: "image/png" }) : new Blob([new Uint8Array(output ?? 0)], { type }));
    });
    return close;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fits the longest side, and never makes an image larger", () => {
    expect(fitSize(4000, 2000, 1000)).toEqual({ width: 1000, height: 500, resized: true });
    expect(fitSize(2000, 4000, 1000)).toEqual({ width: 500, height: 1000, resized: true });
    expect(fitSize(800, 600, 1000)).toEqual({ width: 800, height: 600, resized: false });
  });

  it("returns a smaller WebP with a new extension, and frees the bitmap", async () => {
    const close = stubBrowser(4000, { "image/webp": 300 });
    const result = await compressImage(photo());
    expect(result.type).toBe("image/webp");
    expect(result.name).toBe("holiday.photo.webp");
    expect(result.size).toBe(300);
    expect(close).toHaveBeenCalled();
  });

  it("uses JPEG when the browser cannot write WebP", async () => {
    stubBrowser(4000, { "image/webp": "png", "image/jpeg": 400 });
    const result = await compressImage(photo());
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("holiday.photo.jpg");
  });

  it("keeps the original if compression does not help", async () => {
    stubBrowser(800, { "image/webp": 2000 });
    const original = photo();
    expect(await compressImage(original)).toBe(original);
  });

  it("does not touch GIF or SVG", async () => {
    for (const type of ["image/gif", "image/svg+xml"]) {
      const original = photo(type);
      expect(await compressImage(original)).toBe(original);
    }
  });
});

describe("Select native", () => {
  const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];

  it("uses the browser select, connected to its Field, and reports the value", async () => {
    const onValueChange = vi.fn();
    render(<Field label="Role"><Select native name="role" options={options} placeholder="Choose" onValueChange={onValueChange} /></Field>);
    const select = screen.getByLabelText("Role") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("");
    expect(select.name).toBe("role");
    await userEvent.selectOptions(select, "b");
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("stays controlled when the value starts empty", () => {
    const { rerender } = render(<Select native aria-label="Role" options={options} value={undefined} onValueChange={() => {}} />);
    const select = screen.getByRole("combobox", { name: "Role" }) as HTMLSelectElement;
    expect(select.value).toBe("");
    rerender(<Select native aria-label="Role" options={options} value="a" onValueChange={() => {}} />);
    expect(select.value).toBe("a");
  });
});

describe("Progress ranges", () => {
  const ranges = [{ upTo: 80, tone: "warning" as const }, { upTo: 50, tone: "danger" as const }, { upTo: 100, tone: "success" as const }];

  it("takes the tone of the range that contains the value", () => {
    expect(rangeTone(0, ranges)).toBe("danger");
    expect(rangeTone(50, ranges)).toBe("danger");
    expect(rangeTone(51, ranges)).toBe("warning");
    expect(rangeTone(100, ranges)).toBe("success");
    expect(rangeTone(150, ranges)).toBe("success");
    expect(rangeTone(10, [], "accent")).toBe("accent");
  });

  it("puts each tone of the gradient in the middle of its range", () => {
    expect(progressGradient(100, ranges, "accent")).toBe("linear-gradient(90deg, var(--kora-danger) 25%, var(--kora-warning) 65%, var(--kora-success) 90%)");
  });

  it("paints only the pieces up to the value, each with its own tone", () => {
    const { container } = render(<Progress value={60} ranges={ranges} fill="segments" segments={10} />);
    const pieces = [...container.querySelectorAll<HTMLElement>("[role=progressbar] > span")];
    expect(pieces).toHaveLength(10);
    expect(pieces[0]!.style.background).toContain("--kora-danger");
    expect(pieces[5]!.style.background).toContain("--kora-warning");
    expect(pieces[6]!.style.background).toBe("");
  });
});

describe("EventCalendar helpers", () => {
  it("reads times, and rejects text that is not a time", () => {
    expect(parseTime("09:30")).toBe(570);
    expect(parseTime("2:30 pm")).toBe(870);
    expect(parseTime("12 a.m.")).toBe(0);
    expect(parseTime("12:15 PM")).toBe(735);
    for (const bad of ["25:00", "13 pm", "10:75", "soon", "", undefined]) expect(parseTime(bad)).toBeNull();
  });

  it("gives events at the same time separate lanes, and leaves others at full width", () => {
    const event = (id: string, time: string, endTime?: string) => ({ id, title: id, date: "2026-11-05", time, endTime });
    const placed = placeEvents([event("c", "12:00"), event("a", "09:00", "10:00"), event("b", "09:30", "10:30"), event("d", "10:00", "11:00")]);
    const by = Object.fromEntries(placed.map((p) => [p.event.id, p]));
    expect([by.a!.lane, by.a!.lanes]).toEqual([0, 2]);
    expect([by.b!.lane, by.b!.lanes]).toEqual([1, 2]);
    expect([by.d!.lane, by.d!.lanes]).toEqual([0, 2]);
    expect([by.c!.lane, by.c!.lanes]).toEqual([0, 1]);
  });

  it("gives very short events enough height, and leaves out events with no time", () => {
    const placed = placeEvents([{ id: "a", title: "a", date: "2026-11-05", time: "09:00", endTime: "09:05" }, { id: "b", title: "b", date: "2026-11-05" }]);
    expect(placed).toHaveLength(1);
    expect(placed[0]!.end).toBe(570);
  });

  it("moves by the size of the view, including across a short month", () => {
    const jan31 = new Date(2026, 0, 31);
    expect(dayKey(shiftDate(jan31, "day", 1))).toBe("2026-02-01");
    expect(dayKey(shiftDate(jan31, "week", -1))).toBe("2026-01-24");
    expect(dayKey(shiftDate(jan31, "month", 1))).toBe("2026-02-01");
    expect(dayKey(shiftDate(jan31, "list", -1))).toBe("2025-12-01");
    expect(dayKey(shiftDate(jan31, "year", 1))).toBe("2027-01-01");
  });

  it("finds the week of a date", () => {
    const monday = weekDays(new Date(2026, 10, 1), 1); // A Sunday.
    expect(dayKey(monday[0]!)).toBe("2026-10-26");
    expect(dayKey(monday[6]!)).toBe("2026-11-01");
    expect(dayKey(weekDays(new Date(2026, 10, 1), 0)[0]!)).toBe("2026-11-01");
  });
});

describe("EventCalendar", () => {
  const events = [
    { id: "1", title: "Morning visit", date: "2026-11-05", time: "09:30" },
    { id: "2", title: "Holiday", date: "2026-11-05" },
    { id: "3", title: "Other month", date: "2026-12-10", time: "10:00" },
  ];
  const view = (name: string) => screen.getByRole("radio", { name });

  it("changes view, and moves by the open view", async () => {
    render(<EventCalendar events={events} defaultDate={new Date(2026, 10, 5)} />);
    const heading = () => screen.getByRole("heading", { level: 2 }).textContent;
    expect(heading()).toBe("November 2026");
    await userEvent.click(view("Year"));
    expect(heading()).toBe("2026");
    expect(screen.getByRole("button", { name: /December.*2026, 1 event$/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(heading()).toBe("2027");
    await userEvent.click(view("Day"));
    expect(screen.queryByText("Morning visit")).toBeNull();
  });

  it("opens a day from the month grid, and sends clicks on events", async () => {
    const onEventClick = vi.fn();
    render(<EventCalendar events={events} defaultDate={new Date(2026, 10, 1)} onEventClick={onEventClick} />);
    await userEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Thursday, November 5" }));
    expect(screen.getByRole("radio", { name: "Day" }).getAttribute("data-state")).toBe("on");
    expect(screen.getByText("All day")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: /Morning visit/ })[0]!);
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it("lists only the days with events in the month, and offers to add on a day", async () => {
    const onAddEvent = vi.fn();
    render(<EventCalendar events={events} defaultDate={new Date(2026, 10, 5)} defaultView="list" onAddEvent={onAddEvent} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(screen.queryByText("Other month")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Add event, Thursday, November 5" }));
    expect(dayKey(onAddEvent.mock.calls[0]![0])).toBe("2026-11-05");
  });

  it("hides the switch with one view", () => {
    render(<EventCalendar events={events} defaultDate={new Date(2026, 10, 5)} views={["month"]} />);
    expect(screen.queryByRole("radio")).toBeNull();
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

describe("Kanban", () => {
  it("shows the total of a column, or the cards it has", () => {
    render(<Kanban aria-label="Board" columns={[{ id: "a", title: "A", count: 14, cards: [{ id: "1", title: "One" }] }, { id: "b", title: "B", cards: [{ id: "2", title: "Two" }] }]} />);
    expect(screen.getByText("14")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });
});

describe("moving Kanban cards", () => {
  const one = { id: "1", title: "One" };
  const first = { id: "a", title: "A", cards: [one] };
  const second = { id: "b", title: "B", cards: [] };
  const columns = [first, second];

  it("moves a dragged card to the column it lands on", () => {
    const onCardMove = vi.fn();
    render(<Kanban aria-label="Board" columns={columns} onCardMove={onCardMove} />);
    const dataTransfer = { setData: () => {}, effectAllowed: "", dropEffect: "" };
    fireEvent.dragStart(screen.getByText("One").closest("[draggable]")!, { dataTransfer });
    const target = screen.getByText("B").parentElement!.parentElement!;
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(onCardMove).toHaveBeenCalledWith(one, first, second);
  });

  it("ignores a drop on its own column and things dragged from elsewhere", () => {
    const onCardMove = vi.fn();
    render(<Kanban aria-label="Board" columns={columns} onCardMove={onCardMove} />);
    const dataTransfer = { setData: () => {}, effectAllowed: "", dropEffect: "" };
    const own = screen.getByText("A").parentElement!.parentElement!;
    fireEvent.drop(screen.getByText("B").parentElement!.parentElement!, { dataTransfer });
    fireEvent.dragStart(screen.getByText("One").closest("[draggable]")!, { dataTransfer });
    fireEvent.drop(own, { dataTransfer });
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("moves a card with its menu, without dragging", async () => {
    const onCardMove = vi.fn();
    render(<Kanban aria-label="Board" columns={columns} onCardMove={onCardMove} />);
    await userEvent.click(screen.getByRole("button", { name: "Move: One" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "B" }));
    expect(onCardMove).toHaveBeenCalledWith(one, first, second);
  });

  it("cannot be dragged without onCardMove", () => {
    render(<Kanban aria-label="Board" columns={columns} />);
    expect(screen.getByText("One").closest("[draggable]")).toBeNull();
    expect(screen.queryByRole("button", { name: "Move: One" })).toBeNull();
  });
});

describe("QuickActions", () => {
  it("renders a link with href and a button with onSelect", async () => {
    const { QuickActions } = await import("./widgets");
    const onSelect = vi.fn();
    render(<QuickActions actions={[{ id: "a", label: "Abrir", href: "/x" }, { id: "b", label: "Agregar", onSelect }]} />);
    expect(screen.getByRole("link", { name: "Abrir" }).getAttribute("href")).toBe("/x");
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe("SharePreview", () => {
  it("prints the domain and the breadcrumb like the networks", () => {
    expect(shareDomain("https://www.site.com/a?b=1")).toBe("site.com");
    expect(shareBreadcrumb("https://site.com/blog/mi%20post/")).toBe("https://site.com › blog › mi post");
  });

  it("cuts long text at a word, with an ellipsis", () => {
    expect(clipText("short", 60)).toBe("short");
    expect(clipText("Talleres de mecánica en Panamá, servicio rápido y garantizado", 40)).toBe("Talleres de mecánica en Panamá, servicio…");
  });

  it("draws the big X card only with an image", () => {
    expect(xCardLayout(undefined, "a.png")).toBe("large");
    expect(xCardLayout("summary", "a.png")).toBe("small");
    expect(xCardLayout("summary_large_image", undefined)).toBe("small");
  });

  it("leaves the image out when there is none", () => {
    const { container } = render(<SharePreview network="whatsapp" url="https://site.com" title="Hola" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("site.com");
  });
});

describe("SocialFloat", () => {
  it("builds safe links for each network", async () => {
    const { socialUrl } = await import("./social-float");
    expect(socialUrl("whatsapp", "+507 6000-0000", "Hola, ¿precio & horario?")).toBe("https://wa.me/50760000000?text=Hola%2C%20%C2%BFprecio%20%26%20horario%3F");
    expect(socialUrl("whatsapp", "javascript:alert(1)")).toBe("https://wa.me/1");
    expect(socialUrl("whatsapp", "abc")).toBeNull();
    expect(socialUrl("phone", "+507 6000-0000")).toBe("tel:+50760000000");
    expect(socialUrl("email", "hola@site.com", "Hola")).toBe("mailto:hola@site.com?body=Hola");
    expect(socialUrl("email", "javascript:alert(1)")).toBeNull();
    expect(socialUrl("instagram", "@mi.tienda")).toBe("https://ig.me/m/mi.tienda");
    expect(socialUrl("telegram", "https://t.me/soporte")).toBe("https://t.me/soporte");
    expect(socialUrl("x", "javascript:alert(1)")).toBeNull();
    expect(socialUrl("linkedin", "http://evil.com")).toBeNull();
  });

  it("links one contact straight to the chat, and opens a menu for several that Escape closes", async () => {
    const { SocialFloat } = await import("./social-float");
    const { unmount } = render(<SocialFloat contacts={[{ name: "Ventas", to: "+507 1" }]} message="Hola" />);
    expect(screen.getByRole("link", { name: "Chat on WhatsApp" }).getAttribute("href")).toBe("https://wa.me/5071?text=Hola");
    unmount();
    const user = userEvent.setup();
    render(<SocialFloat contacts={[{ name: "Ventas", to: "1" }, { name: "Instagram", network: "instagram", to: "tienda" }, { name: "Taller", to: "2", message: "Cita" }]} />);
    await user.click(screen.getByRole("button", { name: "Contact us" }));
    expect(screen.getByRole("menuitem", { name: "Taller" }).getAttribute("href")).toBe("https://wa.me/2?text=Cita");
    expect(screen.getByRole("menuitem", { name: "Instagram" }).getAttribute("href")).toBe("https://ig.me/m/tienda");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("Rating", () => {
  it("moves in half steps with the keyboard and goes with a form", async () => {
    const { Rating } = await import("./rating");
    const onChange = vi.fn();
    const { container } = render(<Rating step={0.5} defaultValue={3} name="score" onChange={onChange} />);
    const slider = screen.getByRole("slider", { name: "Rating" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(3.5);
    expect(slider.getAttribute("aria-valuetext")).toBe("3.5 of 5");
    fireEvent.keyDown(slider, { key: "End" });
    expect(container.querySelector<HTMLInputElement>('input[name="score"]')!.value).toBe("5");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("is an image with its value when read only", async () => {
    const { Rating } = await import("./rating");
    render(<Rating readOnly value={4.4} step={0.5} />);
    expect(screen.getByRole("img", { name: "Rating: 4.5 of 5" })).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});

describe("QRCode", () => {
  it("encodes text, accents included, as an SVG and says when it does not fit", async () => {
    const { QRCode, qrMatrix } = await import("./qr");
    expect(qrMatrix("hi", "L")!.length).toBe(21);
    // Round trip: jsQR (the reader fallback) reads the matrix back, accents included.
    const { default: jsQR } = await import("jsqr");
    const m = qrMatrix("Más café ☕", "M")!, px = 4, side = (m.length + 8) * px;
    const img = new Uint8ClampedArray(side * side * 4).fill(255);
    m.forEach((row, y) => row.forEach((dark, x) => {
      if (!dark) return;
      for (let dy = 0; dy < px; dy++) for (let dx = 0; dx < px; dx++) img.fill(0, (((y + 4) * px + dy) * side + (x + 4) * px + dx) * 4, (((y + 4) * px + dy) * side + (x + 4) * px + dx) * 4 + 3);
    }));
    expect(jsQR(img, side, side)?.data).toBe("Más café ☕");
    const { container, unmount } = render(<QRCode value="https://kora.dev" level="Q" />);
    expect(screen.getByRole("img", { name: "QR code: https://kora.dev" }).tagName).toBe("svg");
    expect(container.querySelector("path")!.getAttribute("d")).toMatch(/^M\d/);
    unmount();
    render(<QRCode value={"x".repeat(4000)} />);
    expect(screen.getByRole("alert").textContent).toContain("too long");
  });
});

describe("QRReader", () => {
  const media = navigator.mediaDevices;
  afterEach(() => Object.defineProperty(navigator, "mediaDevices", { value: media, configurable: true }));

  it("tells apart a blocked camera from no camera", async () => {
    const { QRReader, cameraStatus } = await import("./qr");
    expect(cameraStatus({ name: "NotFoundError" })).toBe("unavailable");
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: () => Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" })) } });
    const onError = vi.fn();
    render(<QRReader onDecode={() => {}} onError={onError} />);
    expect(await screen.findByText(/Camera access is blocked/)).toBeTruthy();
    expect(onError).toHaveBeenCalledWith("denied", expect.anything());
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("reads with the native detector and turns the camera off when it leaves the page", async () => {
    const { QRReader } = await import("./qr");
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] };
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: () => Promise.resolve(stream) } });
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    // The native detector, as in Chrome: it reads a code and the reader reports it.
    vi.stubGlobal("BarcodeDetector", Object.assign(class { detect = async () => [{ rawValue: "MESA-4" }]; }, { getSupportedFormats: async () => ["qr_code"] }));
    const onDecode = vi.fn();
    const { unmount } = render(<QRReader onDecode={onDecode} />);
    await vi.waitFor(() => expect(onDecode).toHaveBeenCalledWith("MESA-4"));
    unmount();
    expect(stop).toHaveBeenCalled();
    play.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe("VideoPlayer", () => {
  it("formats time and plays with Space and K", async () => {
    const { VideoPlayer, formatVideoTime } = await import("./video-player");
    expect(formatVideoTime(75)).toBe("1:15");
    expect(formatVideoTime(3725)).toBe("1:02:05");
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    render(<VideoPlayer src="a.mp4" title="Demo" captions={[{ src: "a.vtt", srclang: "es", label: "Español" }]} />);
    const player = screen.getByRole("group", { name: "Demo" });
    fireEvent.keyDown(player, { key: " " });
    fireEvent.keyDown(player, { key: "K" });
    expect(play).toHaveBeenCalledTimes(2);
    const cc = screen.getByRole("button", { name: "Captions" });
    expect(cc.getAttribute("aria-pressed")).toBe("false");
    fireEvent.keyDown(player, { key: "c" });
    expect(cc.getAttribute("aria-pressed")).toBe("true");
    play.mockRestore();
  });
});

describe("ConfettiButton", () => {
  it("keeps still with reduced motion and still runs onClick", async () => {
    const { ConfettiButton } = await import("./confetti-button");
    const mm = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const onClick = vi.fn();
    render(<ConfettiButton onClick={onClick}>Publicar</ConfettiButton>);
    await userEvent.click(screen.getByRole("button", { name: "Publicar" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(document.querySelector("canvas")).toBeNull();
    mm.mockRestore();
  });
});

import { CodeBlock, CodeEditor, highlight } from "./code";
import { JsonViewer, jsonPath, jsonRows } from "./json-viewer";
import { EmojiPicker } from "./emoji-picker";
import { Mentions, mentionQuery, parseMentions } from "./mentions";
import { beforeEach } from "vitest";

describe("CodeBlock", () => {
  it("colors keywords, strings and calls, line by line", () => {
    const [first, second] = highlight('const a = "x";\nrun(a)', "ts");
    expect(first!.find((t) => t.value === "const")?.type).toBe("keyword");
    expect(first!.find((t) => t.value === '"x"')?.type).toBe("string");
    expect(second!.find((t) => t.value === "run")?.type).toBe("func");
    expect(highlight("a\nb", "cobol")).toEqual([[{ type: "text", value: "a" }], [{ type: "text", value: "b" }]]);
  });

  it("copies the code, says so, and marks lines", async () => {
    const user = userEvent.setup();
    const { container } = render(<CodeBlock code={"npm i kora-ui\nnpm run dev\n"} language="bash" title="Terminal" highlightLines={[2]} lineNumbers />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(await navigator.clipboard.readText()).toBe("npm i kora-ui\nnpm run dev");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    expect(container.querySelectorAll("[data-highlighted]")).toHaveLength(1);
  });
});

describe("CodeEditor", () => {
  it("indents with Tab, keeps indentation on Enter, and goes with a form", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<form><CodeEditor name="css" aria-label="CSS" defaultValue="" onChange={onChange} /></form>);
    const box = screen.getByRole("textbox", { name: "CSS" }) as HTMLTextAreaElement;
    await user.click(box);
    await user.keyboard("a {{");
    await user.keyboard("{Enter}");
    expect(box.value).toBe("a {\n  ");
    await user.keyboard("{Tab}b");
    expect(box.value).toBe("a {\n    b");
    expect(document.activeElement).toBe(box);
    expect(onChange).toHaveBeenLastCalledWith("a {\n    b");
    expect(new FormData(container.querySelector("form")!).get("css")).toBe("a {\n    b");
  });
});

describe("JsonViewer", () => {
  const data = { user: { name: "Ana", tags: ["a", "b"] }, "first name": "Ana", bio: "x".repeat(100) };

  it("builds paths and opens levels up to expandDepth", () => {
    expect(jsonPath(["user", "tags", 0])).toBe("user.tags[0]");
    expect(jsonPath(["first name"])).toBe('["first name"]');
    expect(jsonRows(data, 0, new Set()).map((r) => r.id)).toEqual(['["user"]', '["first name"]', '["bio"]']);
    expect(jsonRows(data, 1, new Set())).toHaveLength(5);
    expect(jsonRows(data, 1, new Set(['["user"]']))).toHaveLength(3);
  });

  it("moves and opens with the keyboard, and cuts long strings", async () => {
    const user = userEvent.setup();
    render(<JsonViewer data={data} expandDepth={0} maxStringLength={20} />);
    const [first] = screen.getAllByRole("treeitem");
    expect(first).toHaveAttribute("aria-expanded", "false");
    first!.focus();
    await user.keyboard("{ArrowRight}");
    expect(first).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toContain("name");
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(first);
    expect(screen.getByText(`"${"x".repeat(20)}…"`)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByText(`"${"x".repeat(100)}"`)).toBeTruthy();
  });
});

describe("EmojiPicker", () => {
  // Node's own localStorage shadows jsdom's here, so each test gets a plain one.
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("finds emojis by Spanish or English words and remembers recent ones", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<EmojiPicker onSelect={onSelect} />);
    await screen.findByRole("button", { name: "grinning face" });
    await user.type(screen.getByRole("searchbox"), "corazon roto");
    await user.click(screen.getByRole("button", { name: "broken heart" }));
    expect(onSelect).toHaveBeenCalledWith("💔");
    expect(JSON.parse(localStorage.getItem("kora-emoji-recent")!)).toEqual(["💔"]);
    await user.clear(screen.getByRole("searchbox"));
    expect(screen.getByRole("heading", { name: "Recent" })).toBeTruthy();
  });

  it("still works when storage is blocked", async () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    const onSelect = vi.fn();
    render(<EmojiPicker onSelect={onSelect} />);
    await userEvent.click(await screen.findByRole("button", { name: "thumbs up" }));
    expect(onSelect).toHaveBeenCalledWith("👍");
  });
});

describe("Mentions", () => {
  const people = [{ value: "ana", label: "Ana García" }, { value: "luis", label: "Luis Pérez" }];

  it("parses mentions and finds the one being typed", () => {
    expect(parseMentions("hola @ana y @luis. Otra vez @ana, correo a@b.com")).toEqual(["ana", "luis"]);
    expect(mentionQuery("hola @an", 8)).toBe("an");
    expect(mentionQuery("correo a@b", 10)).toBeNull();
  });

  it("suggests after @ and inserts the handle with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Mentions aria-label="Comment" options={people} onChange={onChange} />);
    const box = screen.getByRole("textbox", { name: "Comment" });
    await user.type(box, "hola @pé");
    expect(screen.getByRole("option", { name: /Luis Pérez/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("hola @luis ");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("asks onSearch and keeps only the latest answer", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn(async (q: string) => people.filter((p) => p.value.startsWith(q)));
    render(<Mentions aria-label="Comment" onSearch={onSearch} />);
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "@lu");
    expect(await screen.findByRole("option", { name: /Luis/ })).toBeTruthy();
    expect(onSearch).toHaveBeenLastCalledWith("lu");
  });
});

describe("PdfViewer", () => {
  it("loads only http(s), blob, and relative links", async () => {
    const { pdfSource } = await import("./pdf-viewer");
    expect(pdfSource("/media/a.pdf", "https://site.com/x")).toBe("https://site.com/media/a.pdf");
    expect(pdfSource("https://cdn.com/a.pdf")).toBe("https://cdn.com/a.pdf");
    expect(pdfSource("javascript:alert(1)")).toBeNull();
    expect(pdfSource("data:application/pdf;base64,AA")).toBeNull();
  });

  it("shows the file in a frame with open and download links, and an empty state with no file", async () => {
    const { PdfViewer } = await import("./pdf-viewer");
    const { unmount } = render(<PdfViewer file="https://cdn.com/docs/factura%2001.pdf" page={2} />);
    expect(await screen.findByTitle("factura 01.pdf")).toHaveAttribute("src", "https://cdn.com/docs/factura%2001.pdf#page=2");
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("download", "factura 01.pdf");
    unmount();
    render(<PdfViewer file={null} />);
    expect(screen.getByText("No PDF loaded")).toBeTruthy();
  });
});

describe("FileDrop", () => {
  it("formats sizes", async () => {
    const { formatBytes } = await import("./file-drop");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatBytes(1500)).toBe("1 KB");
  });

  it("rejects the wrong type and the wrong size, and hands a good file to onFile", async () => {
    const { FileDrop } = await import("./file-drop");
    const onFile = vi.fn();
    const { container } = render(<FileDrop accept={["application/pdf"]} maxSize={10} onFile={onFile} />);
    const input = container.querySelector('input[name="file"]') as HTMLInputElement;
    const drop = (f: File) => fireEvent.change(input, { target: { files: [f] } });
    // jsdom has no DataTransfer constructor; the component only needs add() and files.
    (globalThis as { DataTransfer?: unknown }).DataTransfer ??= class { items = { add: () => {} }; files = [] as unknown as FileList; };
    drop(new File(["x"], "a.png", { type: "image/png" }));
    expect(screen.getByRole("alert").textContent).toBe("That format won't work. Try another file.");
    drop(new File(["x".repeat(20)], "big.pdf", { type: "application/pdf" }));
    expect(screen.getByRole("alert").textContent).toContain("is over");
    drop(new File(["x"], "ok.pdf", { type: "application/pdf" }));
    expect(onFile).toHaveBeenCalledOnce();
    expect(screen.getByText("ok.pdf")).toBeTruthy();
  });
});
