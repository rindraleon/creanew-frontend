import { describe, expect, it } from "vitest";
import { hasWebpVariants, webpSrcSet, webpVariants } from "./responsiveImage";

describe("webpVariants", () => {
  it("génère les variantes d'un JPEG local, dans l'ordre croissant", () => {
    expect(webpVariants("/images/hero.jpg", 1376)).toEqual([
      { src: "/images/hero-480.webp", descriptor: "480w" },
      { src: "/images/hero-960.webp", descriptor: "960w" },
      { src: "/images/hero-1376.webp", descriptor: "1376w" },
    ]);
  });

  it("ne propose jamais une variante plus large que la source", () => {
    // Un visuel de 600 px ne doit pas avoir de descripteur 1600w.
    expect(webpVariants("/images/products/lampe-halo.jpg", 600)).toEqual([
      { src: "/images/products/lampe-halo-480.webp", descriptor: "480w" },
    ]);
  });

  it("gère les sous-dossiers", () => {
    expect(webpSrcSet("/images/products/sofa-oslo.jpg", 1408)).toBe(
      "/images/products/sofa-oslo-480.webp 480w, " +
        "/images/products/sofa-oslo-960.webp 960w, " +
        "/images/products/sofa-oslo-1408.webp 1408w",
    );
  });

  it("ignore les URL non locales (CDN, MinIO) : repli sur le <img> simple", () => {
    expect(webpVariants("https://cdn.example.com/a.jpg", 1408)).toEqual([]);
    expect(webpVariants("/images/a.png", 1408)).toEqual([]);
    expect(webpVariants("blob:http://localhost/xyz", 1408)).toEqual([]);
    expect(hasWebpVariants("https://cdn.example.com/a.jpg", 1408)).toBe(false);
  });

  it("détecte les JPEG locaux, insensibles à la casse", () => {
    expect(hasWebpVariants("/images/HERO.JPEG", 1408)).toBe(true);
  });
});
