import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Facebook,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import { authApi, type SocialProvider } from "@/features/auth/api/auth.api";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { loginSchema, registerSchema } from "@/features/auth/schemas/auth";
import type { LoginInput, RegisterFormInput } from "@/features/auth/schemas/auth";
import { ApiError } from "@/shared/api/client";
import { errorMessage } from "@/shared/utils/errors";
import type { AuthUser } from "@/shared/types/api";
import { cn } from "@/lib/utils";

export type AuthIntent = "customer" | "seller";

interface AuthPanelProps {
  initialMode?: "login" | "register";
  notice?: string;
  onSuccess: (user: AuthUser, intent: AuthIntent) => void;
}

type Mode = "login" | "register";

const BENEFITS: Record<AuthIntent, string[]> = {
  customer: [
    "Suivi de commandes et de livraisons en temps réel",
    "Favoris et panier synchronisés sur tous vos écrans",
    "Échange direct avec l’atelier qui fabrique votre meuble",
  ],
  seller: [
    "Dossier boutique vérifié par l’équipe CreaNew",
    "Catalogue, photos et stock gérés depuis un seul espace",
    "Ventes, commandes et chiffre d’affaires consolidés",
  ],
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-label-sm font-medium text-error">
      {message}
    </p>
  );
}

export default function AuthPanel({ initialMode = "login", notice = "", onSuccess }: AuthPanelProps) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [intent, setIntent] = useState<AuthIntent>("customer");
  const [providers, setProviders] = useState<Record<SocialProvider, boolean>>({
    google: false,
    facebook: false,
  });
  const [status, setStatus] = useState<{ type: "info" | "success"; text: string } | null>(
    notice ? { type: "info", text: notice } : null,
  );
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const registerForm = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let active = true;
    authApi
      .providers()
      .then((configured) => {
        if (active) setProviders(configured);
      })
      .catch(() => {
        setProviders({ google: false, facebook: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    loginForm.resetField("password");
    registerForm.resetField("password");
    registerForm.resetField("confirmPassword");
    loginForm.clearErrors();
    registerForm.clearErrors();
    setStatus(null);
    setMode(next);
  };

  const submitLogin = loginForm.handleSubmit(async ({ identifier, password }) => {
    loginForm.clearErrors("root");
    try {
      const user = await login(identifier, password);
      loginForm.resetField("password");
      onSuccess(user, intent);
    } catch (error) {
      loginForm.resetField("password");
      loginForm.setError("root", { message: errorMessage(error, "Connexion impossible.") });
    }
  });

  const submitRegister = registerForm.handleSubmit(async (values) => {
    registerForm.clearErrors("root");
    try {
      await register({
        username: values.username,
        firstName: values.firstName || null,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      });
      registerForm.reset();
      loginForm.setValue("identifier", values.email);
      setMode("login");
      setStatus({
        type: "success",
        text:
          intent === "seller"
            ? "Compte créé. Connectez-vous pour déposer votre dossier boutique."
            : "Compte créé. Vous pouvez maintenant vous connecter.",
      });
    } catch (error) {
      registerForm.resetField("password");
      registerForm.resetField("confirmPassword");
      if (error instanceof ApiError && error.fieldError("email")) {
        registerForm.setError("email", { message: error.fieldError("email") });
      } else if (error instanceof ApiError && error.code === "USERNAME_ALREADY_USED") {
        registerForm.setError("username", { message: error.message });
      } else if (error instanceof ApiError && error.code === "EMAIL_ALREADY_USED") {
        registerForm.setError("email", { message: error.message });
      } else {
        registerForm.setError("root", { message: errorMessage(error, "Inscription impossible.") });
      }
    }
  });

  const startOAuth = (provider: SocialProvider) => {
    authApi.oauth(provider, false);
  };

  const busy = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;
  const hasSocial = providers.google || providers.facebook;
  const isRegister = mode === "register";
  const registerErrors = registerForm.formState.errors;
  const loginErrors = loginForm.formState.errors;
  const errors = isRegister ? registerErrors : loginErrors;
  const rootError = errors.root?.message;

  const inputClass = (invalid: boolean) =>
    cn(
      "h-12 w-full rounded-md border bg-surface-container-lowest pl-11 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-ring/40",
      invalid ? "border-error" : "border-outline-variant focus:border-secondary",
    );

  return (
    <section
      className="w-full overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-card"
      aria-labelledby="auth-heading"
    >
      <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <aside className="relative hidden flex-col justify-between bg-primary p-8 text-on-primary lg:flex">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logo-creanew.jpg"
                alt="CreaNew"
                className="h-11 w-11 rounded-md object-cover"
              />
              <span className="text-headline-sm font-extrabold tracking-tight">CreaNew</span>
            </Link>
            <p className="mt-8 text-label-sm font-semibold uppercase tracking-[0.18em] text-secondary-fixed-dim">
              {intent === "seller" ? "Espace professionnel" : "Espace client"}
            </p>
            <h2 className="mt-3 text-headline-md font-extrabold leading-tight">
              {intent === "seller"
                ? "Vendez vos meubles à Antananarivo"
                : "Votre intérieur, pièce par pièce"}
            </h2>
            <ul className="mt-7 space-y-3">
              {BENEFITS[intent].map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-body-sm text-primary-fixed-dim">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-secondary-fixed-dim" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <img
                src="/images/atelier-480.webp"
                alt="Atelier CreaNew"
                className="h-28 w-full rounded-lg object-cover opacity-90"
                loading="lazy"
              />
              <img
                src="/images/hero-480.webp"
                alt="Canapé CreaNew en situation"
                className="h-28 w-full rounded-lg object-cover opacity-90"
                loading="lazy"
              />
            </div>
            <p className="flex items-center gap-2 border-t border-white/10 pt-4 text-label-sm text-primary-fixed-dim">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-secondary-fixed-dim" />
              Cookies httpOnly · Sessions révocables à tout moment
            </p>
          </div>
        </aside>

        <div className="p-6 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
              <img src="/logo-creanew.jpg" alt="CreaNew" className="h-9 w-9 rounded-md object-cover" />
              <span className="text-body-lg font-extrabold text-primary">CreaNew</span>
            </Link>
            <button
              type="button"
              onClick={() => void navigate("/")}
              className="ml-auto text-label-md font-semibold text-on-surface-variant transition-colors hover:text-secondary"
            >
              Retour à la boutique
            </button>
          </div>

          <h1 id="auth-heading" className="mt-6 text-headline-md font-extrabold text-primary">
            {isRegister ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="mt-1.5 text-body-sm text-on-surface-variant">
            {isRegister
              ? "Choisissez votre parcours, puis renseignez vos informations."
              : "Accédez à votre espace CreaNew."}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2" role="tablist" aria-label="Type de compte">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => switchMode("login")}
              className={cn(
                "rounded-md border px-3 py-2.5 text-label-md font-semibold transition-colors",
                mode === "login"
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary hover:text-secondary",
              )}
            >
              J’ai déjà un compte
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => switchMode("register")}
              className={cn(
                "rounded-md border px-3 py-2.5 text-label-md font-semibold transition-colors",
                mode === "register"
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary hover:text-secondary",
              )}
            >
              Je crée un compte
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Parcours">
            {(
              [
                { key: "customer", label: "Client", hint: "Acheter", icon: ShoppingBag },
                { key: "seller", label: "Vendeur", hint: "Vendre", icon: Store },
              ] as const
            ).map(({ key, label, hint, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={intent === key}
                onClick={() => setIntent(key)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
                  intent === key
                    ? "border-secondary bg-secondary-container text-on-secondary-container"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary/60",
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                <span className="text-label-md font-semibold">{label}</span>
                <span className="ml-auto text-label-sm">{hint}</span>
              </button>
            ))}
          </div>

          {status && (
            <p
              role="status"
              className={cn(
                "mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-body-sm",
                status.type === "success"
                  ? "border-secondary/40 bg-secondary-container text-on-secondary-container"
                  : "border-outline-variant bg-surface-container-low text-on-surface",
              )}
            >
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{status.text}</span>
            </p>
          )}

          {isRegister ? (
            <form onSubmit={(event) => void submitRegister(event)} className="mt-5 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="reg-username" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                    Nom d’utilisateur
                  </label>
                  <div className="relative">
                    <User aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="reg-username"
                      autoComplete="username"
                      className={inputClass(Boolean(registerErrors.username))}
                      aria-invalid={Boolean(registerErrors.username)}
                      aria-describedby={registerErrors.username ? "reg-username-error" : undefined}
                      {...registerForm.register("username")}
                    />
                  </div>
                  <FieldError id="reg-username-error" message={registerErrors.username?.message} />
                </div>
                <div>
                  <label htmlFor="reg-lastname" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                    Nom
                  </label>
                  <div className="relative">
                    <User aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="reg-lastname"
                      autoComplete="family-name"
                      className={inputClass(Boolean(registerErrors.lastName))}
                      aria-invalid={Boolean(registerErrors.lastName)}
                      aria-describedby={registerErrors.lastName ? "reg-lastname-error" : undefined}
                      {...registerForm.register("lastName")}
                    />
                  </div>
                  <FieldError id="reg-lastname-error" message={registerErrors.lastName?.message} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="reg-firstname" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                    Prénom <span className="font-normal text-on-surface-variant">(facultatif)</span>
                  </label>
                  <div className="relative">
                    <User aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="reg-firstname"
                      autoComplete="given-name"
                      className={inputClass(Boolean(registerErrors.firstName))}
                      aria-invalid={Boolean(registerErrors.firstName)}
                      {...registerForm.register("firstName")}
                    />
                  </div>
                  <FieldError id="reg-firstname-error" message={registerErrors.firstName?.message} />
                </div>
                <div>
                  <label htmlFor="reg-phone" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                    Téléphone <span className="font-normal text-on-surface-variant">(facultatif)</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+261 34 00 000 00"
                    className={cn(inputClass(Boolean(registerErrors.phone)), "pl-4")}
                    aria-invalid={Boolean(registerErrors.phone)}
                    {...registerForm.register("phone")}
                  />
                  <FieldError id="reg-phone-error" message={registerErrors.phone?.message} />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass(Boolean(registerErrors.email))}
                    aria-invalid={Boolean(registerErrors.email)}
                    aria-describedby={registerErrors.email ? "reg-email-error" : undefined}
                    {...registerForm.register("email")}
                  />
                </div>
                <FieldError id="reg-email-error" message={registerErrors.email?.message} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="reg-password" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={cn(inputClass(Boolean(registerErrors.password)), "pr-11")}
                      aria-invalid={Boolean(registerErrors.password)}
                      aria-describedby={registerErrors.password ? "reg-password-error" : undefined}
                      {...registerForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-on-surface-variant hover:text-secondary"
                    >
                      {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError id="reg-password-error" message={registerErrors.password?.message} />
                </div>
                <div>
                  <label htmlFor="reg-confirm" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                    Confirmation
                  </label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={inputClass(Boolean(registerErrors.confirmPassword))}
                      aria-invalid={Boolean(registerErrors.confirmPassword)}
                      aria-describedby={registerErrors.confirmPassword ? "reg-confirm-error" : undefined}
                      {...registerForm.register("confirmPassword")}
                    />
                  </div>
                  <FieldError id="reg-confirm-error" message={registerErrors.confirmPassword?.message} />
                </div>
              </div>

              <p className="text-label-sm text-on-surface-variant">
                8 caractères minimum, au moins une lettre et un chiffre.
              </p>

              {rootError && (
                <p role="alert" className="rounded-md border border-error/40 bg-error-container px-3 py-2.5 text-body-sm text-on-error-container">
                  {rootError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-label-lg font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
                {busy ? "Création…" : "Créer mon compte"}
                {!busy && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
              </button>

              {intent === "seller" && (
                <p className="rounded-md border border-dashed border-outline-variant bg-surface-container-low px-3 py-2.5 text-label-sm text-on-surface-variant">
                  La création du compte est l’étape 1. Vous déposerez ensuite le dossier de votre
                  boutique (« Devenir vendeur ») pour validation par l’équipe.
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={(event) => void submitLogin(event)} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="login-identifier" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                  E-mail ou nom d’utilisateur
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="login-identifier"
                    autoComplete="username"
                    className={inputClass(Boolean(loginErrors.identifier))}
                    aria-invalid={Boolean(loginErrors.identifier)}
                    aria-describedby={loginErrors.identifier ? "login-identifier-error" : undefined}
                    {...loginForm.register("identifier")}
                  />
                </div>
                <FieldError id="login-identifier-error" message={loginErrors.identifier?.message} />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-label-md font-semibold text-on-surface">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={cn(inputClass(Boolean(registerErrors.password)), "pr-11")}
                    aria-invalid={Boolean(registerErrors.password)}
                    aria-describedby={registerErrors.password ? "login-password-error" : undefined}
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-on-surface-variant hover:text-secondary"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError id="login-password-error" message={registerErrors.password?.message} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-label-md font-semibold text-secondary hover:text-secondary/80"
                >
                  Mot de passe oublié ?
                </Link>
                {intent === "seller" && (
                  <Link to="/devenir-vendeur" className="text-label-sm text-on-surface-variant hover:text-secondary">
                    Dossier vendeur
                  </Link>
                )}
              </div>

              {rootError && (
                <p role="alert" className="rounded-md border border-error/40 bg-error-container px-3 py-2.5 text-body-sm text-on-error-container">
                  {rootError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-label-lg font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
                {busy ? "Connexion…" : "Se connecter"}
                {!busy && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
              </button>
            </form>
          )}

          {hasSocial && (
            <div className="mt-5">
              <p className="flex items-center gap-3 text-label-sm uppercase tracking-wider text-on-surface-variant">
                <span className="h-px flex-1 bg-outline-variant" />
                ou
                <span className="h-px flex-1 bg-outline-variant" />
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {providers.google && (
                  <button
                    type="button"
                    onClick={() => startOAuth("google")}
                    disabled={busy}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-outline-variant text-label-md font-semibold text-on-surface transition-colors hover:border-secondary hover:text-secondary disabled:opacity-60"
                  >
                    Google
                  </button>
                )}
                {providers.facebook && (
                  <button
                    type="button"
                    onClick={() => startOAuth("facebook")}
                    disabled={busy}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-outline-variant text-label-md font-semibold text-on-surface transition-colors hover:border-secondary hover:text-secondary disabled:opacity-60"
                  >
                    <Facebook aria-hidden="true" className="h-4 w-4" />
                    Facebook
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="mt-5 text-label-sm leading-relaxed text-on-surface-variant">
            En continuant, vous acceptez les{" "}
            <Link to="/conditions-generales" className="font-semibold text-secondary hover:underline">
              conditions d’utilisation
            </Link>{" "}
            et la{" "}
            <Link to="/confidentialite" className="font-semibold text-secondary hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
