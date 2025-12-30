// Fix TypeScript errors script
const fs = require('fs');
const path = require('path');

const filePath = 'C:\\SIH 2025\\ayurveda-herb-traceability\\frontend\\src\\app\\formulation\\page.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix all onChange events
content = content.replace(/onChange=\{(\w*)\s*=>\s*/g, 'onChange={(e: React.ChangeEvent<HTMLInputElement>) => ');
content = content.replace(/onChange=\{(\w*)\s*=>\s*setFormulation/g, 'onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormulation');
content = content.replace(/onChange=\{(\w*)\s*=>\s*update/g, 'onChange={(e: React.ChangeEvent<HTMLInputElement>) => update');

// Fix onValueChange events  
content = content.replace(/onValueChange=\{(\w*)\s*=>\s*/g, 'onValueChange={(value: string) => ');

console.log('TypeScript errors should be fixed!');