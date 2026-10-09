import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { post, type Account } from "./api";
import { Button, Field, Notice } from "./ui";
export function AuthScreen({
  register = false,
  onAccount,
}: {
  register?: boolean;
  onAccount?: (account: Account) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <section className="card auth-card">
      <p className="eyebrow">WELCOME TO CARTWISE</p>
      <h1>{register ? "Create your account" : "Welcome back"}</h1>
      <p>Keep your grocery history in one place.</p>
      {error && <Notice error>{error}</Notice>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          const values = new FormData(e.currentTarget);
          try {
            const account = await post<Account>(
              `/auth/${register ? "register" : "login"}`,
              { email: values.get("email"), password: values.get("password") },
            );
            onAccount?.(account);
            navigate("/");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to sign in.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          minLength={10}
          maxLength={128}
          required
        />
        <p className="muted">Use at least 10 characters.</p>
        <Button disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
        </Button>
      </form>
      <p>
        {register ? "Already registered? " : "New here? "}
        <Link to={register ? "/login" : "/register"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
