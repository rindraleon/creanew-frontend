import AuthSwitch, { type AuthSwitchProps } from "@/components/ui/auth-switch";

/** Intégration du composant dans les fournisseurs de l'application. */
export default function Demo(props: AuthSwitchProps) {
  return <AuthSwitch {...props} />;
}
