import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard, { type CardProduct } from "@/components/ProductCard";
import { StoreContextValueForTests } from "../setup/store-harness";

const product: CardProduct = {
  id: 1,
  slug: "aurora-silk-wrap-dress",
  name: "Aurora Silk Wrap Dress",
  price: 189,
  compareAtPrice: 260,
  rating: 4.8,
  reviewCount: 412,
  images: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
  badges: ["Best Seller", "Trending"],
  store: "Amazon",
  inStock: true,
  color: "#f5f5f4",
};

function renderCard(overrides: Partial<CardProduct> = {}, store = {}) {
  const value = StoreContextValueForTests(store);
  return {
    ...render(
      <value.Provider>
        <ProductCard product={{ ...product, ...overrides }} />
      </value.Provider>
    ),
    store: value.spies,
  };
}

describe("ProductCard", () => {
  /**
   * REGRESSION (rc.1): the quick-view link and add-to-cart button were nested
   * *inside* the image link. Browsers hoist nested anchors out of each other,
   * so the parsed DOM never matched React's tree and every page containing a
   * card threw hydration error #418. Interactive elements must stay siblings.
   */
  describe("DOM validity", () => {
    it("nests no anchor inside another anchor", () => {
      const { container } = renderCard();
      container.querySelectorAll("a").forEach((anchor) => {
        expect(anchor.querySelector("a")).toBeNull();
      });
    });

    it("nests no button inside an anchor", () => {
      const { container } = renderCard();
      container.querySelectorAll("a").forEach((anchor) => {
        expect(anchor.querySelector("button")).toBeNull();
      });
    });

    it("nests no anchor inside a button", () => {
      const { container } = renderCard();
      container.querySelectorAll("button").forEach((button) => {
        expect(button.querySelector("a")).toBeNull();
      });
    });

    it("uses an article element for the card root", () => {
      const { container } = renderCard();
      expect(container.querySelector("article")).toBeInTheDocument();
    });
  });

  describe("content", () => {
    it("shows the product name linking to its page", () => {
      const { container } = renderCard();
      // The card has two links to the product: the media link (aria-labelled,
      // removed from the tab order) and the visible title link in the heading.
      const titleLink = within(container.querySelector("h3") as HTMLElement).getByRole("link");
      expect(titleLink).toHaveTextContent(product.name);
      expect(titleLink).toHaveAttribute("href", `/products/${product.slug}`);
    });

    it("keeps the decorative media link out of the tab order to avoid a duplicate stop", () => {
      const { container } = renderCard();
      const mediaLink = container.querySelector(`a[aria-label="${product.name}"]`);
      expect(mediaLink).toHaveAttribute("tabindex", "-1");
    });

    it("shows the current price and the struck-through compare-at price", () => {
      renderCard();
      expect(screen.getByText(/189/)).toBeInTheDocument();
      expect(screen.getByText(/260/)).toBeInTheDocument();
    });

    it("shows the discount badge computed from the two prices", () => {
      renderCard();
      expect(screen.getByText("-27%")).toBeInTheDocument();
    });

    it("omits the discount badge when there is no saving", () => {
      renderCard({ compareAtPrice: null });
      expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
    });

    it("renders the store name and review count", () => {
      renderCard();
      expect(screen.getByText(/amazon/i)).toBeInTheDocument();
      expect(screen.getByText(/412/)).toBeInTheDocument();
    });

    it("renders at most two badges so the card cannot overflow", () => {
      renderCard({ badges: ["Best Seller", "Trending", "New", "Deal"] });
      expect(screen.getByText("Best Seller")).toBeInTheDocument();
      expect(screen.queryByText("Deal")).not.toBeInTheDocument();
    });

    it("flags out-of-stock products", () => {
      renderCard({ inStock: false });
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("adds the product to the cart", async () => {
      const { store } = renderCard();
      await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));
      expect(store.addToCart).toHaveBeenCalledWith(product.id);
    });

    it("toggles the wishlist", async () => {
      const { store } = renderCard();
      await userEvent.click(screen.getByRole("button", { name: /wishlist/i }));
      expect(store.toggleWishlist).toHaveBeenCalledWith(product.id);
    });

    it("toggles compare", async () => {
      const { store } = renderCard();
      await userEvent.click(screen.getByRole("button", { name: /compare/i }));
      expect(store.toggleCompare).toHaveBeenCalledWith(product.id);
    });

    it("offers a quick-view link to the product page", () => {
      renderCard();
      expect(screen.getByRole("link", { name: /quick view/i })).toHaveAttribute("href", `/products/${product.slug}`);
    });
  });

  describe("accessibility", () => {
    it("names every control, including the product it acts on", () => {
      const { container } = renderCard();
      container.querySelectorAll("button, a").forEach((el) => {
        const name = el.getAttribute("aria-label") || el.textContent?.trim();
        expect(name, `${el.tagName} has no accessible name`).toBeTruthy();
      });
    });

    it("exposes wishlist and compare as toggle buttons with pressed state", () => {
      renderCard({}, { wishlistIds: [product.id], compareIds: [product.id] });
      expect(screen.getByRole("button", { name: /wishlist/i })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /compare/i })).toHaveAttribute("aria-pressed", "true");
    });

    it("reports the unpressed state when the product is in neither list", () => {
      renderCard();
      expect(screen.getByRole("button", { name: /wishlist/i })).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps the product title in a heading for document structure", () => {
      const { container } = renderCard();
      const heading = container.querySelector("h3");
      expect(within(heading as HTMLElement).getByText(product.name)).toBeInTheDocument();
    });
  });

  describe("images", () => {
    it("renders the primary image", () => {
      const { container } = renderCard();
      expect(container.querySelector(`img[src="${product.images[0]}"]`)).toBeInTheDocument();
    });

    it("does not crash when a product has no images", () => {
      expect(() => renderCard({ images: [] })).not.toThrow();
    });
  });
});
