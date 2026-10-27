import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SearchOverlay from "./SearchOverlay";
import { productsApi } from "../../features/products/api/products.api";

/**
 * Régression : la recherche ne doit jamais interroger l'API avec `limit: 0`
 * (l'API renvoie 422 « limit must not be less than 1 »). Avant correction,
 * chaque page de l'application déclenchait cette requête en erreur.
 */
describe("SearchOverlay", () => {
  const listSpy = vi.spyOn(productsApi, "list");

  const renderOverlay = () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={client}>
        <SearchOverlay open onClose={() => undefined} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    listSpy.mockReset();
    listSpy.mockResolvedValue({
      items: [],
      meta: { page: 1, limit: 6, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("n'appelle pas l'API avant 2 caractères saisis", async () => {
    const user = userEvent.setup();
    renderOverlay();

    const input = screen.getByLabelText("Rechercher un produit");
    await user.type(input, "a");

    // Laisse le temps à une éventuelle requête de partir.
    await waitFor(() => expect(screen.getByText(/au moins 2 caractères/i)).toBeInTheDocument());
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("interroge l'API à partir de 2 caractères", async () => {
    const user = userEvent.setup();
    renderOverlay();

    const input = screen.getByLabelText("Rechercher un produit");
    await user.type(input, "ca");

    await waitFor(() => expect(listSpy).toHaveBeenCalled());
    expect(listSpy).toHaveBeenCalledWith({ search: "ca", limit: 6 });
  });

  it("n'envoie jamais limit: 0 (422 côté API)", async () => {
    const user = userEvent.setup();
    renderOverlay();

    const input = screen.getByLabelText("Rechercher un produit");
    await user.type(input, "x");
    await user.clear(input);

    await waitFor(() => expect(screen.getByText(/au moins 2 caractères/i)).toBeInTheDocument());
    expect(listSpy).not.toHaveBeenCalled();
    expect(
      listSpy.mock.calls.some(([query]) => (query as { limit?: number }).limit === 0),
    ).toBe(false);
  });
});
