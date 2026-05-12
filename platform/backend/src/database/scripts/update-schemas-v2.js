import fs from 'fs';
import path from 'path';

const schemasDir = 'c:/FindingGithub/archestra/platform/backend/src/database/schemas';
const auditImport = 'import { auditColumns } from "../utils/audit";\n';

const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'audit.ts');

files.forEach(file => {
    const filePath = path.join(schemasDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('auditColumns')) return;

    console.log(`Processing ${file}...`);

    // 1. Better Import Insertion
    // Find the last index of any import closing
    const importRegex = /^import\s+[\s\S]*?;\s*$/gm;
    let lastIndex = 0;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex > 0) {
        content = content.slice(0, lastIndex) + '\n' + auditImport + content.slice(lastIndex);
    } else {
        content = auditImport + content;
    }

    // 2. Safer Body Replacement
    // We look for the table definition
    const tableRegex = /const\s+\w+Table\s*=\s*pgTable\s*\(\s*["']\w+["']\s*,\s*{([\s\S]*?)}\s*(,|\);|\);|\s*,)/;
    const tableMatch = content.match(tableRegex);

    if (tableMatch) {
        let tableBody = tableMatch[1];
        const fullMatch = tableMatch[0];
        
        // Remove existing audit-like columns
        tableBody = tableBody.replace(/^\s*createdAt:[\s\S]*?\),?/gm, '');
        tableBody = tableBody.replace(/^\s*updatedAt:[\s\S]*?\),?/gm, '');
        
        // Remove trailing commas before adding our new block
        tableBody = tableBody.trimEnd();
        if (tableBody.endsWith(',')) {
            tableBody = tableBody.slice(0, -1);
        }
        
        tableBody += ',\n    ...auditColumns,\n  ';
        
        const newTableDef = fullMatch.replace(tableMatch[1], tableBody);
        content = content.replace(fullMatch, newTableDef);
    }

    fs.writeFileSync(filePath, content);
});

console.log("Done updating schemas safely.");
