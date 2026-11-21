const fs = require('fs');
const content = fs.readFileSync('sheet_edit.html', 'utf8');

// Let's search for occurrences of "gid=" or "sheetId" or gridId in the file
const gidMatches = content.match(/gid=(\d+)/g) || [];
console.log('GIDs encontrados con "gid=":', [...new Set(gidMatches)]);

// Let's search for sheet name patterns
// Often in Google Sheets web: [0,"Sheet Name",null,null,...]
const pattern = /\[\s*(\d{1,12})\s*,\s*"([^"]{2,50})"\s*,\s*null\s*,\s*null/g;
let m;
console.log('--- PATRON TABS ---');
while ((m = pattern.exec(content)) !== null) {
  console.log('GID:', m[1], 'Titulo:', m[2]);
}

// Search for any occurrence of the word "Clientes" in context
let idx = 0;
while ((idx = content.indexOf('Clientes', idx)) !== -1) {
  console.log('\nContexto de "Clientes":');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 250)));
  idx += 8;
}
