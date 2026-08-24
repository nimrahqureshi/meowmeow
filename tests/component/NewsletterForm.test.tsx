import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsletterForm from "@/components/NewsletterForm";

/**
 * REGRESSION (rc.1): the footer and blog forms were server actions that posted
 * to the API and discarded the response, so a failure was indistinguishable
 * from a success. Every outcome must now be reported to the subscriber.
 */
describe("NewsletterForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());

  const ok = (body: object = { message: "You're subscribed." }) =>
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => body });

  it("labels the email field for screen readers", () => {
    render(<NewsletterForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("rejects an invalid address without calling the API", async () => {
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a valid address to the newsletter endpoint", async () => {
    ok();
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "reader@example.com");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/newsletter", expect.objectContaining({ method: "POST" })));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "reader@example.com" });
  });

  it("confirms success with a status message", async () => {
    ok({ message: "You're subscribed. Check your inbox." });
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "reader@example.com");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/subscribed/i);
  });

  it("surfaces a server error instead of silently appearing to succeed", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "That address looks wrong" }) });
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "reader@example.com");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/looks wrong/i);
  });

  it("explains a rate-limited response in plain language", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "reader@example.com");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many/i);
  });

  it("reports a network failure rather than hanging", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "reader@example.com");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/connection|couldn't reach/i);
  });

  it("clears the error once the subscriber edits the field again", async () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText(/email address/i);
    await userEvent.type(input, "bad");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await userEvent.type(input, "@example.com");
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("marks the field invalid for assistive technology on error", async () => {
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "bad");
    await userEvent.click(screen.getByRole("button", { name: /join/i }));
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toHaveAttribute("aria-invalid", "true"));
  });
});
