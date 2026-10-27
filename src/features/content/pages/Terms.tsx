import StaticContentPage from "../components/StaticContentPage";

export default function Terms() {
  return (
    <StaticContentPage
      title="Conditions générales"
      intro="Les règles du jeu : ce que nous nous engageons à faire, et ce que nous attendons de vous."
      updatedAt="1er janvier 2026"
      path="/conditions-generales"
      sections={[
        {
          heading: "1. Objet",
          paragraphs: [
            "Les présentes conditions régissent toute commande passée sur mobilier-shop.mg. En validant une commande, vous acceptez l'intégralité de ces conditions. Elles s'appliquent à tout acheteur, professionnel ou particulier.",
          ],
        },
        {
          heading: "2. Produits",
          paragraphs: [
            "Les fiches produits décrivent les articles avec la plus grande précision possible. Les teintes de bois et de tissu peuvent légèrement varier d'une série à l'autre. Les stocks affichés sont ceux du dernier relevé : un produit épuisé ne peut pas être ajouté au panier.",
          ],
        },
        {
          heading: "3. Prix",
          paragraphs: [
            "Les prix sont indiqués en ariary, toutes taxes comprises. Ils sont applicables au moment de la validation de la commande. La livraison est facturée séparément, sauf offre en cours, et toujours affichée avant paiement.",
          ],
        },
        {
          heading: "4. Commande et paiement",
          paragraphs: [
            "Une commande n'est confirmée qu'après réception du paiement. Les références de paiement Mobile Money sont vérifiées manuellement par notre équipe sous 48 heures ouvrées : la commande reste en « paiement en cours de vérification » tant que ce contrôle n'est pas fait. Aucune validation n'est automatique.",
          ],
        },
        {
          heading: "5. Livraison",
          paragraphs: [
            "Les délais courent à partir de la confirmation du paiement. Un retard de livraison ne donne pas lieu à pénalité, mais vous pouvez annuler sans frais si le retard dépasse 15 jours ouvrés.",
          ],
        },
        {
          heading: "6. Droit de rétractation",
          paragraphs: [
            "Vous disposez de 30 jours pour vous rétracter, dans les conditions détaillées sur la page Livraison & retours.",
          ],
        },
        {
          heading: "7. Garanties",
          paragraphs: [
            "Tous nos meubles sont garantis 2 ans contre les défauts de fabrication. La garantie ne couvre pas l'usure normale, les dommages liés à un montage non conforme ou à un usage extérieur non prévu.",
          ],
        },
        {
          heading: "8. Responsabilité",
          paragraphs: [
            "Notre responsabilité est limitée à la valeur des produits commandés. Nous ne pouvons être tenus responsables des dommages indirects (perte d'exploitation, perte de données).",
          ],
        },
        {
          heading: "9. Litiges",
          paragraphs: [
            "En cas de différend, nous cherchons toujours une solution à l'amiable. À défaut, le droit malgache s'applique et les tribunaux d'Antananarivo sont seuls compétents.",
          ],
        },
      ]}
    />
  );
}
