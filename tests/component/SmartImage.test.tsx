import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SmartImage from "@/components/SmartImage";

/**
 * REGRESSION (rc.1): remote product imagery can fail (dead CDN link, blocked
 * network). SmartImage must degrade to a branded placeholder that occupies the
 * same box, so a failure never produces a broken icon or a layout shift.
 */
describe("SmartImage", () => {
  it("renders an img for a valid source", () => {
    render(<SmartImage src="https://example.com/a.jpg" alt="A dress" />);
    expect(screen.getByAltText("A dress")).toBeInTheDocument();
  });

  it("lazy-loads and decodes asynchronously by default", () => {
    render(<SmartImage src="https://example.com/a.jpg" alt="A dress" />);
    const img = screen.getByAltText("A dress");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
  });

  it("honours an eager/high-priority request for above-the-fold art", () => {
    render(<SmartImage src="https://example.com/a.jpg" alt="Hero" loading="eager" fetchPriority="high" />);
    expect(screen.getByAltText("Hero")).toHaveAttribute("loading", "eager");
  });

  it("falls back to the branded placeholder when the image errors", () => {
    render(<SmartImage src="https://example.com/broken.jpg" alt="A dress" />);
    fireEvent.error(screen.getByAltText("A dress"));
    // The fallback keeps the accessible name via role="img" + aria-label.
    expect(screen.getByRole("img", { name: "A dress" })).toBeInTheDocument();
  });

  it("renders the fallback immediately when no source is supplied", () => {
    render(<SmartImage src={null} alt="Missing" />);
    expect(screen.getByRole("img", { name: "Missing" })).toBeInTheDocument();
  });

  it("preserves the layout box on fallback, so nothing shifts", () => {
    const { container, rerender } = render(<SmartImage src="https://example.com/a.jpg" alt="X" className="w-full h-full object-cover" />);
    fireEvent.error(screen.getByAltText("X"));
    rerender(<SmartImage src="https://example.com/a.jpg" alt="X" className="w-full h-full object-cover" />);
    expect(container.firstElementChild).toHaveClass("w-full", "h-full");
  });

  it("accepts a tint without crashing and ignores an invalid one", () => {
    expect(() => render(<SmartImage src={null} alt="A" tint="#ff0000" />)).not.toThrow();
    expect(() => render(<SmartImage src={null} alt="B" tint="not-a-colour" />)).not.toThrow();
  });

  it("keeps an empty alt on decorative images", () => {
    const { container } = render(<SmartImage src="https://example.com/a.jpg" alt="" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
