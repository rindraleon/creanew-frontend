import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  Facebook,
  KeyRound,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthProvider";
import { loginSchema, registerSchema, usernameSchema } from "../../features/auth/schemas/auth";
import type { LoginInput, RegisterFormInput } from "../../features/auth/schemas/auth";
import { authApi, type SocialProvider } from "../../features/auth/api/auth.api";
import { ApiError } from "../../shared/api/client";
import { errorMessage } from "../../shared/utils/errors";
import type { AuthUser } from "../../shared/types/api";
import "./auth-switch.css";

export interface AuthSwitchProps {
  onSuccess?: (user: AuthUser) => void;
  initialMode?: "login" | "register";
  initialNotice?: string;
}

type TextFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  icon: LucideIcon;
  error?: string;
  autoComplete: string;
  type?: "text" | "email";
  required?: boolean;
};

function TextField({
  id,
  label,
  placeholder,
  registration,
  icon: Icon,
  error,
  autoComplete,
  type = "text",
  required = true,
}: TextFieldProps) {
  return (
    <div className="auth-field">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div className={`auth-input ${error ? "auth-input--invalid" : ""}`}>
        <Icon className="auth-input__icon" size={18} aria-hidden="true" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={autoComplete === "username" || type === "email" ? "none" : "words"}
          spellCheck={false}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
        />
      </div>
      {error && (
        <span className="sr-only" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  registration,
  error,
  autoComplete,
  allowReveal = true,
}: Omit<TextFieldProps, "icon" | "type" | "required"> & { allowReveal?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div className={`auth-input auth-input--password ${error ? "auth-input--invalid" : ""}`}>
        <KeyRound className="auth-input__icon" size={18} aria-hidden="true" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
        />
        {allowReveal && (
          <button
            type="button"
            className="auth-input__reveal"
            onClick={() => setVisible((value) => !value)}
            aria-label={
              visible ? `Masquer ${label.toLowerCase()}` : `Afficher ${label.toLowerCase()}`
            }
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="sr-only" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function AuthSwitch({
  onSuccess,
  initialMode = "login",
  initialNotice = "",
}: AuthSwitchProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [providers, setProviders] = useState<Record<SocialProvider, boolean>>({
    google: false,
    facebook: false,
  });
  const [notice, setNotice] = useState(initialNotice);
  const { login, register } = useAuth();
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
    if (initialNotice) setNotice(initialNotice);
  }, [initialNotice]);

  useEffect(() => {
    let active = true;
    authApi
      .providers()
      .then((configured) => {
        if (active) setProviders(configured);
      })
      .catch(() => {
        // Le formulaire classique reste disponible sans fournisseur social.
      });
    return () => {
      active = false;
    };
  }, []);

  const switchMode = (next: "login" | "register") => {
    if (next === mode) return;
    loginForm.resetField("password");
    registerForm.resetField("password");
    registerForm.resetField("confirmPassword");
    loginForm.clearErrors();
    registerForm.clearErrors();
    setNotice("");
    setMode(next);
  };

  const onLogin = loginForm.handleSubmit(async ({ identifier, password }) => {
    loginForm.clearErrors("root");
    try {
      const user = await login(identifier, password);
      loginForm.resetField("password");
      onSuccess?.(user);
    } catch (error) {
      loginForm.resetField("password");
      loginForm.setError("root", { message: errorMessage(error, "Connexion impossible.") });
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
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
      setNotice("Votre compte est créé. Vous pouvez maintenant vous connecter.");
      setMode("login");
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

  const social = (provider: SocialProvider) => {
    const username = usernameSchema.safeParse(registerForm.getValues("username"));
    if (mode === "register" && !username.success) {
      registerForm.setError("username", {
        message: username.error.issues[0]?.message ?? "Nom d’utilisateur requis.",
      });
      return;
    }
    loginForm.resetField("password");
    registerForm.resetField("password");
    registerForm.resetField("confirmPassword");
    authApi.oauth(provider, mode === "register", username.success ? username.data : "");
  };

  const busy = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;
  const loginErrors = loginForm.formState.errors;
  const registerErrors = registerForm.formState.errors;
  const loginError =
    loginErrors.root?.message || loginErrors.identifier?.message || loginErrors.password?.message;
  const registerError =
    registerErrors.root?.message ||
    (registerErrors.username?.message &&
      `Nom d’utilisateur : ${registerErrors.username.message}`) ||
    (registerErrors.email?.message && `E-mail : ${registerErrors.email.message}`) ||
    registerErrors.firstName?.message ||
    registerErrors.lastName?.message ||
    registerErrors.password?.message ||
    registerErrors.confirmPassword?.message;
  const hasSocial = providers.google || providers.facebook;
  const isRegister = mode === "register";

  return (
    <main className="auth-page">
      <div className={`auth-switch ${isRegister ? "auth-switch--register" : ""}`}>
        <aside className="auth-switch__visual" aria-label="Changer de parcours">
          <Link className="auth-brand" to="/" aria-label="CreaNew, retourner à l’accueil">
            <img src="/logo-creanew.jpg" alt="" />
            <span>
              CreaNew
              <small>VOTRE ESPACE PERSONNEL</small>
            </span>
          </Link>
          <div className="auth-promo">
            <span className="auth-promo__eyebrow">BIENVENUE CHEZ CREANEW</span>
            <h2>{isRegister ? "Déjà membre ?" : "Nouveau par ici ?"}</h2>
            <p>
              {isRegister
                ? "Retrouvez votre espace, vos envies et vos commandes."
                : "Créez votre espace et retrouvez toutes vos envies au même endroit."}
            </p>
            <button
              type="button"
              className="auth-promo__button"
              disabled={busy}
              onClick={() => switchMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Se connecter" : "Créer un compte"}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <span className="auth-visual-caption" aria-hidden="true">
            UN INTÉRIEUR QUI VOUS RESSEMBLE
          </span>
        </aside>

        <section className="auth-switch__form-area" aria-labelledby="auth-title">
          <div className={`auth-content ${isRegister ? "auth-content--register" : ""}`}>
            <div className="auth-heading">
              <span className="auth-heading__eyebrow">VOTRE ESPACE CREANEW</span>
              <h1 id="auth-title">{isRegister ? "Créer un compte" : "Connexion"}</h1>
              <p>
                {isRegister
                  ? "Quelques détails pour commencer."
                  : "Heureux de vous retrouver parmi nous."}
              </p>
            </div>

            {notice && !isRegister && (
              <p className="auth-notice" role="status">
                {notice}
              </p>
            )}

            {isRegister ? (
              <form className="auth-form" onSubmit={(event) => void onRegister(event)} noValidate>
                <div className="auth-fields auth-fields--grid">
                  <TextField
                    id="register-username"
                    label="Nom d’utilisateur"
                    placeholder="Nom d’utilisateur"
                    icon={UserRound}
                    autoComplete="username"
                    registration={registerForm.register("username")}
                    error={registerErrors.username?.message}
                  />
                  <TextField
                    id="register-email"
                    label="Adresse e-mail"
                    placeholder="E-mail"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    registration={registerForm.register("email")}
                    error={registerErrors.email?.message}
                  />
                  <TextField
                    id="register-first-name"
                    label="Prénom (facultatif)"
                    placeholder="Prénom (fac.)"
                    icon={UserRound}
                    autoComplete="given-name"
                    required={false}
                    registration={registerForm.register("firstName")}
                    error={registerErrors.firstName?.message}
                  />
                  <TextField
                    id="register-last-name"
                    label="Nom"
                    placeholder="Nom"
                    icon={UserRound}
                    autoComplete="family-name"
                    registration={registerForm.register("lastName")}
                    error={registerErrors.lastName?.message}
                  />
                  <PasswordField
                    id="register-password"
                    label="Mot de passe"
                    placeholder="Mot de passe"
                    autoComplete="new-password"
                    registration={registerForm.register("password")}
                    error={registerErrors.password?.message}
                  />
                  <PasswordField
                    id="register-confirm-password"
                    label="Confirmer le mot de passe"
                    placeholder="Confirmer"
                    autoComplete="new-password"
                    registration={registerForm.register("confirmPassword")}
                    error={registerErrors.confirmPassword?.message}
                    allowReveal={false}
                  />
                </div>
                <p className="auth-password-hint">
                  8 caractères minimum, une lettre et un chiffre.
                </p>
                {registerError && (
                  <p className="auth-error" role="alert">
                    {registerError}
                  </p>
                )}
                <button
                  className="auth-submit"
                  type="submit"
                  disabled={busy}
                >
                  {busy && <Loader2 size={17} className="auth-spinner" aria-hidden="true" />}
                  {busy ? "Création…" : "Créer mon compte"}
                  {!busy && <ArrowRight size={16} aria-hidden="true" />}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={(event) => void onLogin(event)} noValidate>
                <div className="auth-fields">
                  <TextField
                    id="login-identifier"
                    label="Adresse e-mail ou nom d’utilisateur"
                    placeholder="E-mail ou nom d’utilisateur"
                    icon={AtSign}
                    autoComplete="username"
                    registration={loginForm.register("identifier")}
                    error={loginErrors.identifier?.message}
                  />
                  <PasswordField
                    id="login-password"
                    label="Mot de passe"
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    registration={loginForm.register("password")}
                    error={loginErrors.password?.message}
                  />
                </div>
                <div className="auth-form__forgot">
                  <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
                </div>
                {loginError && (
                  <p className="auth-error" role="alert">
                    {loginError}
                  </p>
                )}
                <button className="auth-submit" type="submit" disabled={busy}>
                  {busy && <Loader2 size={17} className="auth-spinner" aria-hidden="true" />}
                  {busy ? "Connexion…" : "Se connecter"}
                  {!busy && <ArrowRight size={16} aria-hidden="true" />}
                </button>
              </form>
            )}

            {hasSocial && (
              <div className="auth-social">
                <p>
                  <span>ou continuer avec</span>
                </p>
                <div className="auth-social__buttons">
                  {providers.google && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => social("google")}
                    >
                      <span className="auth-social__google" aria-hidden="true">
                        G
                      </span>{" "}
                      Google
                    </button>
                  )}
                  {providers.facebook && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => social("facebook")}
                    >
                      <Facebook size={17} aria-hidden="true" /> Facebook
                    </button>
                  )}
                </div>
              </div>
            )}
            <Link className="auth-back" to="/">
              <ArrowLeft size={15} aria-hidden="true" /> Retour à la boutique
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
