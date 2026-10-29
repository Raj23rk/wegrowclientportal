const fs = require('fs');
const path = require('path');

const frontendSrc = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src');

// 1. Update src/types/index.ts
const typesPath = path.join(frontendSrc, 'types/index.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

typesContent = typesContent.replace('attachments: string[];', 'attachments: any[];');
typesContent = typesContent.replace("status: 'Completed' | 'Upcoming';", "status: 'Completed' | 'Upcoming' | 'Cancelled';\n  start?: string;\n  end?: string;\n  notes?: string;");
typesContent = typesContent.replace('attachments: string[];', 'attachments: any[];');
typesContent = typesContent.replace('next: string[];', 'next: string[];\n  file?: any;');
typesContent = typesContent.replace('logo?: string;', 'logo?: any;');

fs.writeFileSync(typesPath, typesContent, 'utf8');
console.log('1. Updated types/index.ts successfully');
