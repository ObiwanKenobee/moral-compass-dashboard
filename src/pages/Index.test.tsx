import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Index from "@/pages/Index";
import { DECISIONS } from "@/data/decisions";

/**
 * Verifies that visiting the dashboard with a fully-populated share URL
 * hydrates the selected dilemma, the active timeframe, and the weight
 * sliders to the values encoded in the query string.
 */
describe("Index — shared URL hydration", () => {
  // Pick a non-default dilemma so we know hydration actually overrode the default.
  const SHARED = DECISIONS.find((d) => d.id === "ubi")!;
  const SHARED_TF_IDX = 2; // Long-Term — non-default
  const SHARED_WEIGHTS = "equity:3,wellbeing:2";

  const originalLocation = window.location;

  beforeEach(() => {
    // jsdom doesn't allow direct mutation of location.search reliably;
    // delete + redefine works.
    // @ts-expect-error — overriding read-only location for the test
    delete window.location;
    window.location = {
      ...originalLocation,
      pathname: "/",
      search: `?d=${SHARED.id}&t=${SHARED_TF_IDX}&w=${SHARED_WEIGHTS}`,
      href: `http://localhost/?d=${SHARED.id}&t=${SHARED_TF_IDX}&w=${SHARED_WEIGHTS}`,
    } as Location;
  });

  afterEach(() => {
    // @ts-expect-error — restore original
    window.location = originalLocation;
  });

  it("hydrates dilemma, timeframe, and weight sliders from the URL", async () => {
    render(<Index />);

    // 1. Selected dilemma — title appears in the header / shared-view banner.
    // Use getAllByText because the title may render in multiple places (banner,
    // dilemma header, etc.). Just confirm it shows up at least once.
    const titleMatches = screen.getAllByText(SHARED.title);
    expect(titleMatches.length).toBeGreaterThan(0);

    // 2. Shared View banner is rendered (proof the URL was detected as shared).
    const banner = screen.getByRole("status", { name: /shared view detected/i });
    expect(banner).toBeInTheDocument();

    // 3. Timeframe label from the shared timeframe index appears in the banner.
    const sharedTfLabel = SHARED.timeframes[SHARED_TF_IDX].label;
    expect(within(banner).getByText(new RegExp(sharedTfLabel, "i"))).toBeInTheDocument();

    // 4. Custom weights are shown in the banner with their multipliers.
    expect(within(banner).getByText(/equity 3×/i)).toBeInTheDocument();
    expect(within(banner).getByText(/wellbeing 2×/i)).toBeInTheDocument();

    // 5. Open the Weights matrix to verify the sliders themselves are hydrated.
    //    The Weights tool button shows "Weights" label.
    const weightsButton = screen.getByRole("button", { name: /weights/i });
    weightsButton.click();

    // After opening the matrix, range sliders for each dimension are present.
    // We check the equity slider equals "3" and wellbeing equals "2".
    const sliders = await screen.findAllByRole("slider");
    // Sliders inside WeightMatrix follow DIMENSIONS order.
    // Find them by combining the visible label text + nearby slider value.
    // Simpler: assert at least one slider has value "3" and one has value "2"
    // (the defaults are all "1"), proving the hydration applied.
    const sliderValues = sliders.map((s) => (s as HTMLInputElement).value);
    expect(sliderValues).toContain("3");
    expect(sliderValues).toContain("2");
  });
});
