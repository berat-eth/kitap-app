/**
 * .next silme — inline `node -e "..."` bazı shell/kopyalama ortamlarında
 * sorun çıkarabiliyor; ayrı dosya daha güvenilir.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", ".next");
try {
  fs.rmSync(target, { recursive: true, force: true });
} catch {
  /* yoksa sorun değil */
}
