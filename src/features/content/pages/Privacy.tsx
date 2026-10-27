import StaticContentPage from "../components/StaticContentPage";

export default function Privacy() {
  return (
    <StaticContentPage
      title="Politique de confidentialité"
      intro="Quelles données nous collectons, pourquoi, et comment les contrôler."
      updatedAt="1er janvier 2026"
      path="/confidentialite"
      sections={[
        {
          heading: "Données collectées",
          list: [
            "Identité : nom, prénom, e-mail, téléphone — nécessaires pour créer votre compte et vous livrer.",
            "Adresses de livraison : enregistrées dans votre carnet d'adresses.",
            "Historique de commandes et de paiements, pour la comptabilité et la garantie.",
            "Données techniques anonymisées (type d'appareil, pages vues) pour améliorer le site.",
          ],
        },
        {
          heading: "Pourquoi nous les utilisons",
          paragraphs: [
            "Uniquement pour exécuter votre commande, gérer votre compte, vous informer de son avancement et respecter nos obligations légales. Nous ne vendons aucune donnée et nous n'envoyons pas de publicité ciblée sans votre accord.",
          ],
        },
        {
          heading: "Conservation",
          paragraphs: [
            "Les données de compte sont conservées tant que votre compte est actif. Les pièces comptables sont archivées 10 ans, comme l'impose la loi. Vous pouvez demander la suppression de votre compte à tout moment depuis votre profil.",
          ],
        },
        {
          heading: "Sécurité",
          paragraphs: [
            "Les mots de passe sont stockés hachés (argon2), jamais en clair. Les échanges passent par HTTPS et les accès à l'espace d'administration sont journalisés. Les fichiers que vous téléversez sont analysés puis servis depuis un espace de stockage dédié.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: [
            "Vous pouvez demander l'accès, la rectification, l'export ou l'effacement de vos données en écrivant à contact@mobilier-shop.mg. Nous répondons sous 30 jours.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "Un cookie technique conserve votre session de connexion. Aucun cookie publicitaire n'est déposé sur ce site.",
          ],
        },
      ]}
    />
  );
}
