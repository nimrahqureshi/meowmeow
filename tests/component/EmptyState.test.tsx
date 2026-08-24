import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui";

/**
 * Empty screens are an invitation to act, so the shared primitive requires a
 * primary action. These tests pin that contract for cart, wishlist, compare
 * and the catalogue, which all render through it.
 */
describe("EmptyState", () => {
  it("shows the title and description", () => {
    render(<EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add products here." action={{ label: "Browse", href: "/products" }} />);
    expect(screen.getByRole("heading", { name: /your cart is empty/i })).toBeInTheDocument();
    expect(screen.getByText(/add products here/i)).toBeInTheDocument();
  });

  it("renders a link action when given an href", () => {
    render(<EmptyState icon={ShoppingBag} title="t" description="d" action={{ label: "Browse", href: "/products" }} />);
    expect(screen.getByRole("link", { name: "Browse" })).toHaveAttribute("href", "/products");
  });

  it("renders a button action when given a handler", async () => {
    const onClick = vi.fn();
    render(<EmptyState icon={ShoppingBag} title="t" description="d" action={{ label: "Clear filters", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an optional secondary action", () => {
    render(
      <EmptyState icon={ShoppingBag} title="t" description="d" action={{ label: "A", href: "/a" }} secondaryAction={{ label: "B", href: "/b" }} />
    );
    expect(screen.getByRole("link", { name: "B" })).toHaveAttribute("href", "/b");
  });

  it("omits the secondary action when not supplied", () => {
    render(<EmptyState icon={ShoppingBag} title="t" description="d" action={{ label: "A", href: "/a" }} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("always offers a route forward", () => {
    render(<EmptyState icon={ShoppingBag} title="t" description="d" action={{ label: "Go", href: "/products" }} />);
    expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
  });
});
