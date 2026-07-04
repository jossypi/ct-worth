const fs = require('fs');
const image = fs.readFileSync('public/jossypi.jpg');
const base64 = image.toString('base64');
const tsContent = `export const jossyPiBase64 = "data:image/jpeg;base64,${base64}";\n`;
fs.writeFileSync('src/lib/jossypiBase64.ts', tsContent);
console.log('Base64 file generated successfully.');
