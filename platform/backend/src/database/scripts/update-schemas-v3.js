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

    // 1. Safe Import Insertion
    const importLines = content.split('\n').filter(line => line.startsWith('import'));
    if (importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        // If the last import is multi-line, we need to find the actual end
        const lastImportIndex = content.lastIndexOf(lastImport);
        const nextSemicolon = content.indexOf(';', lastImportIndex);
        const insertIndex = nextSemicolon !== -1 ? nextSemicolon + 1 : content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, insertIndex) + '\n' + auditImport + content.slice(insertIndex);
    } else {
        content = auditImport + content;
    }

    // 2. Safe Body Replacement
    // We match the whole table object content
    const tableRegex = /pgTable\s*\(\s*["']\w+["']\s*,\s*{([\s\S]*?)}\s*(\)|,)/;
    const match = content.match(tableRegex);

    if (match) {
        let body = match[1];
        
        // Remove createdAt/updatedAt definitions including all chained methods and trailing commas
        // This regex looks for 'createdAt:' and matches until it sees the next property start '\n  property:' or the end of the object
        body = body.replace(/^\s*createdAt\s*:[\s\S]*?(?=\n\s*\w+\s*:|\n\s*})/gm, '');
        body = body.replace(/^\s*updatedAt\s*:[\s\S]*?(?=\n\s*\w+\s*:|\n\s*})/gm, '');
        
        // Clean up double commas or empty lines
        body = body.replace(/,\s*,/g, ',');
        body = body.trimEnd();
        if (body && !body.endsWith(',')) body += ',';
        
        body += '\n    ...auditColumns,\n  ';
        
        content = content.replace(match[1], body);
    }

    fs.writeFileSync(filePath, content);
});

console.log("Done updating schemas with v3.");
