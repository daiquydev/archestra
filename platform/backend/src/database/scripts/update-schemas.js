import fs from 'fs';
import path from 'path';

const schemasDir = 'c:/FindingGithub/archestra/platform/backend/src/database/schemas';
const auditImport = 'import { auditColumns } from "../utils/audit";\n';

const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
    const filePath = path.join(schemasDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already updated
    if (content.includes('auditColumns')) return;

    console.log(`Processing ${file}...`);

    // 1. Add import
    if (!content.includes('import { auditColumns }')) {
        // Add after last import or at top
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + auditImport + content.slice(endOfLine + 1);
        } else {
            content = auditImport + content;
        }
    }

    // 2. Replace existing createdAt/updatedAt or add to end of table
    const tableMatch = content.match(/const\s+\w+Table\s*=\s*pgTable\s*\(\s*["']\w+["']\s*,\s*{/);
    if (tableMatch) {
        const tableStartIndex = content.indexOf('{', tableMatch.index);
        
        // Find the closing brace of the table definition object
        let braceCount = 0;
        let tableEndIndex = -1;
        for (let i = tableStartIndex; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    tableEndIndex = i;
                    break;
                }
            }
        }

        if (tableEndIndex !== -1) {
            let tableBody = content.slice(tableStartIndex + 1, tableEndIndex);
            
            // Remove existing createdAt/updatedAt definitions
            // This is a bit risky with regex but we try to be broad
            const originalBody = tableBody;
            tableBody = tableBody.replace(/\s*createdAt:\s*timestamp\("created_at".*?\),?/gs, '');
            tableBody = tableBody.replace(/\s*updatedAt:\s*timestamp\("updated_at".*?\),?/gs, '');
            
            // Add auditColumns
            tableBody = tableBody.trimEnd();
            if (tableBody && !tableBody.endsWith(',')) tableBody += ',';
            tableBody += '\n    ...auditColumns,\n  ';

            content = content.slice(0, tableStartIndex + 1) + tableBody + content.slice(tableEndIndex);
        }
    }

    fs.writeFileSync(filePath, content);
});

console.log("Done updating schemas.");
