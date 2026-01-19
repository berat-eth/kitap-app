// TypeScript tip hatalarını düzeltmek için yardımcı script
const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');
const middlewareDir = path.join(__dirname, 'src', 'middleware');

// Controller dosyalarını düzelt
const controllers = fs.readdirSync(controllersDir);

controllers.forEach(file => {
  if (!file.endsWith('.ts')) return;
  
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // RowDataPacket import ekle
  if (!content.includes('import { RowDataPacket }')) {
    content = content.replace(
      /import { Response } from 'express';/,
      `import { Response } from 'express';\nimport { RowDataPacket } from 'mysql2';`
    );
  }
  
  // Array<Type> kullanımlarını düzelt - genel pattern
  content = content.replace(
    /await pool\.execute<Array<([^>]+)>>\(/g,
    (match, type) => {
      const interfaceName = type.replace(/\s+/g, '') + 'Row';
      return `await pool.execute<${interfaceName}[]>(`;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log('Done!');

