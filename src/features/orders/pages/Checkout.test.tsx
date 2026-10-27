import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Checkout from "./Checkout";
import type { Address, Cart } from "../../../shared/types/api";

/**
 * Régression : l'adresse par défaut du carnet doit être présélectionnée.
 * Avant correction, `addressId` valait « new » et le client connu se voyait
 * refuser sa commande (« L'adresse est requise », « La ville est requise »).
 */
const addresses: Address[] = [
  {
    id: "addr-1",
    label: "Bureau",
    fullName: "Camille Moreau",
    phone: "+261 34 00 000 03",
    addressLine1: "Immeuble ARO",
    addressLine2: null,
    postalCode: "101",
    city: "Antananarivo",
    country: "Madagascar",
    isDefault: false,
  },
  {
    id: "addr-2",
    label: "Domicile",
    fullName: "Camille Moreau",
    phone: "+261 34 00 000 03",
    addressLine1: "Lot II M 12 Bis",
    addressLine2: null,
    postalCode: "101",
    city: "Antananarivo",
    country: "Madagascar",
    isDefault: true,
  },
];

const cart: Cart = {
  id: "cart-1",
  items: [
    {
      id: "item-1",
      productId: "prod-1",
      quantity: 1,
      unitPrice: 1_295_000,
      lineTotal: 1_295_000,
      available: true,
      issue: null,
      product: {
        id: "prod-1",
        name: "Banquette Rangement",
        slug: "banquette-rangement",
        price: 1_295_000,
        compareAtPrice: null,
        stock: 9,
        imageUrl: null,
        sellerId: "seller-1",
        sellerName: "Créations Anjara",
      },
    },
  ],
  subtotal: 1_295_000,
  quantity: 1,
  itemCount: 1,
  currency: "MGA",
  warnings: [],
};

const mocks = vi.hoisted(() => ({
  useCart: vi.fn(),
  useAddresses: vi.fn(),
  useCreateOrder: vi.fn(),
  useAuth: vi.fn(),
  useToast: vi.fn(),
}));

vi.mock("../../cart/hooks/useCart", () => ({ useCart: mocks.useCart }));
vi.mock("../../auth/hooks/useAccount", () => ({
  useAddresses: mocks.useAddresses,
  useSaveAddress: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("../hooks/useOrders", () => ({ useCreateOrder: mocks.useCreateOrder }));
vi.mock("../../auth/context/AuthProvider", () => ({ useAuth: mocks.useAuth }));
vi.mock("../../../shared/context/ToastContext", () => ({ useToast: mocks.useToast }));

function renderCheckout() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Bouton radio correspondant à une adresse du carnet. */
const radioFor = (label: string): HTMLInputElement | null => {
  const labels = Array.from(document.querySelectorAll("label"));
  const labelEl = labels.find((l) => l.textContent?.includes(label));
  return (labelEl?.querySelector("input[type='radio']") as HTMLInputElement) ?? null;
};

describe("Checkout — présélection de l'adresse", () => {
  beforeEach(() => {
    mocks.useCart.mockReturnValue({ data: cart, isLoading: false });
    mocks.useAddresses.mockReturnValue({ data: addresses });
    mocks.useCreateOrder.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    mocks.useAuth.mockReturnValue({ user: { fullName: "Camille Moreau", phone: "" } });
    mocks.useToast.mockReturnValue({ toast: vi.fn() });
  });

  it("présélectionne l'adresse marquée par défaut", async () => {
    renderCheckout();

    await waitFor(() => expect(radioFor("Domicile")).not.toBeNull());
    expect(radioFor("Domicile")?.checked).toBe(true);
    expect(radioFor("Bureau")?.checked).toBe(false);
  });

  it("ne rend pas le formulaire de nouvelle adresse tant qu'une adresse est choisie", async () => {
    renderCheckout();

    await waitFor(() => expect(radioFor("Domicile")?.checked).toBe(true));
    expect(document.querySelector('input[name="addressLine1"]')).toBeNull();
    expect(screen.getByRole("button", { name: /valider la commande/i })).toBeEnabled();
  });
});
