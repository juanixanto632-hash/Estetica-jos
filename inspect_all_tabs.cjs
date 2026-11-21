const https = require('https');

const spreadsheetId = '1qK3hjk9BGgLH7rNkA4-2OMju6gTcoiTq7_ktww5hcrc';
const tabs = [
  'Clientes',
  'Citas y Cobros',
  'Catálogo',
  'Catalogo',
  'Resumen',
  'Ingresos por periodo'
];

async function fetchTab(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(tabName)}&tqx=out:json`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/setResponse\(([\s\S]*)\);/);
        if (match) {
          try {
            const json = JSON.parse(match[1]);
            resolve({ name: tabName, status: json.status, table: json.table });
            return;
          } catch (e) {}
        }
        resolve({ name: tabName, status: 'error' });
      });
    }).on('error', () => resolve({ name: tabName, status: 'net_error' }));
  });
}

async function run() {
  for (const t of tabs) {
    const res = await fetchTab(t);
    console.log(`\n========================================`);
    console.log(`PESTAÑA: "${t}" (Status: ${res.status})`);
    console.log(`========================================`);
    if (res.table) {
      const cols = res.table.cols.map((c, i) => c.label ? `${c.id}: "${c.label}"` : `${c.id}`).filter(c => c);
      console.log('Columnas:', cols.slice(0, 15).join(' | '));
      console.log(`Total filas con datos: ${res.table.rows.length}`);
      res.table.rows.slice(0, 6).forEach((r, idx) => {
        const rowVals = (r.c || []).map(cell => cell ? (cell.f || cell.v || '') : '');
        console.log(`  Fila ${idx + 1}: ${rowVals.slice(0, 10).join(' | ')}`);
      });
    }
  }
}

run();
