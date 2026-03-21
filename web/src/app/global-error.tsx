"use client";

/**
 * Root layout ve sağlayıcılar burada YOK — tamamen bağımsız olmalı.
 * Aksi halde build sırasında prerender’da useContext / null hatası oluşabilir.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#f0f0f0",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Bir şeyler ters gitti
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Sayfa yüklenirken beklenmeyen bir hata oluştu.
          </p>
          {process.env.NODE_ENV === "development" && error?.message ? (
            <pre
              style={{
                textAlign: "left",
                fontSize: "0.75rem",
                color: "#c00",
                overflow: "auto",
                marginBottom: "1rem",
              }}
            >
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.25rem",
              background: "#ffffff",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
