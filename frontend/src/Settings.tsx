import { useEffect, useState } from "react";
import { api, post } from "./api";
import { Button, Field, Notice } from "./ui";
export function SettingsScreen() {
  const [retain, setRetain] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    api<{ retainImages: boolean }>("/settings")
      .then((s) => setRetain(s.retainImages))
      .catch((err) => setError(err.message));
  }, []);
  return (
    <>
      <h1>Privacy & settings</h1>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <section className="card">
        <h2>Receipt image retention</h2>
        <p>
          Images are private. By default, images and OCR suggestions are removed
          after confirmation. Pending images remain available for review or
          retry until you delete the receipt.
        </p>
        <label>
          <input
            type="checkbox"
            checked={retain}
            onChange={(e) => setRetain(e.target.checked)}
          />{" "}
          Retain original images after confirmation
        </label>
        <p>
          Turning retention off removes existing confirmed receipt images. This
          cannot restore already deleted images.
        </p>
        <Button
          onClick={async () => {
            try {
              await api("/settings", {
                method: "PATCH",
                body: JSON.stringify({ retainImages: retain }),
              });
              setMessage("Retention preference saved.");
              setError("");
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          Save retention preference
        </Button>
      </section>
      <section className="card">
        <h2>Your data belongs to you</h2>
        <Button
          className="secondary"
          onClick={async () => {
            try {
              const data = await post("/account/export", {});
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                }),
              );
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "cartwise-account.json";
              anchor.click();
              URL.revokeObjectURL(url);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          Export account JSON
        </Button>
        <Field
          label="Password to delete account"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          className="danger"
          disabled={!password}
          onClick={async () => {
            if (
              !window.confirm(
                "Permanently delete all account receipts, images, budgets and products?",
              )
            )
              return;
            try {
              await api("/account", {
                method: "DELETE",
                body: JSON.stringify({ password }),
              });
              window.location.assign("/login");
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          Delete my account
        </Button>
      </section>
      <Notice>
        CartWise supports CAD and your own historical receipt prices. OCR is
        imperfect and requires review. This local demo has no live retailer
        feeds. Deletion does not remove copies you exported or external backups.
      </Notice>
    </>
  );
}
