/**
 * .next silme — inline `node -e "..."` bazı shell/kopyalama ortamlarında
 * sorun çıkarabiliyor; ayrı dosya daha güvenilir.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", ".next");

function removeDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`  Siliniyor: ${dirPath}`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`  Başarıyla silindi: ${dirPath}`);
    } else {
      console.log(`  Zaten mevcut değil: ${dirPath}`);
    }
  } catch (error) {
    console.warn(`  Uyarı: ${dirPath} silinemedi:`, error.message);
    // Alternatif yöntem: manuel silme
    try {
      const { execSync } = require('child_process');
      execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      console.log(`  Alternatif yöntemle silindi: ${dirPath}`);
    } catch (altError) {
      console.error(`  Kritik: ${dirPath} hiçbir yöntemle silinemedi`);
    }
  }
}

removeDirectory(target);
