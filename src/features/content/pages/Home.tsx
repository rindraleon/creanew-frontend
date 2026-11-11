import { useFeaturedProducts, useNewProducts } from "../../products/hooks/useCatalog";
import Hero from "../components/Hero";
import FeatureBar from "../components/FeatureBar";
import CategorySection from "../components/CategorySection";
import ProductSection from "../components/ProductSection";
import PromoBanner from "../components/PromoBanner";
import WhySection from "../components/WhySection";
import BlogTeaser from "../components/BlogTeaser";

export default function Home() {
  // Catalogue servi par l'API : plus aucune donnée en dur.
  const { data: featured = [] } = useFeaturedProducts(4);
  const { data: news = [] } = useNewProducts(4);

  return (
    <>
      <Hero />
      <FeatureBar />
      <CategorySection />
      <ProductSection
        eyebrow="Sélection"
        title="Notre collection signature"
        subtitle="Découvrez la sélection disponible."
        products={featured}
        viewAllLabel="Voir toute la boutique"
      />
      <PromoBanner />
      <ProductSection
        eyebrow="Fraîchement arrivés"
        title="Les nouveautés de la saison"
        subtitle="Découvrez les nouveautés disponibles."
        products={news}
      />
      <WhySection />
      <BlogTeaser />
    </>
  );
}
