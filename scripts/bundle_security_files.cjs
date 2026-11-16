const fs = require('fs');
const path = require('path');

const targetFiles = [
  { priority: 1, path: 'src/app/api/jobs/create/route.ts', label: 'Authentication, job creation, company ownership', lang: 'typescript' },
  { priority: 2, path: 'src/middleware.ts', label: 'Server-side route protection & Edge security', lang: 'typescript' },
  { priority: 3, path: 'src/app/api/otp/send/route.ts', label: 'OTP rate limiting and security', lang: 'typescript' },
  { priority: 4, path: 'src/app/api/otp/verify/route.ts', label: 'OTP expiration and brute force', lang: 'typescript' },
  { priority: 5, path: 'src/app/api/otp/complete/route.ts', label: 'Registration and duplicate accounts', lang: 'typescript' },
  { priority: 6, path: 'src/lib/otpServer.ts', label: 'OTP security architecture & DB admin client', lang: 'typescript' },
  { priority: 7, path: 'src/lib/supabase.ts', label: 'Supabase client configuration', lang: 'typescript' },
  { priority: 8, path: 'src/services/db.ts', label: 'Database operations and permissions', lang: 'typescript' },
  { priority: 9, path: 'src/App.tsx', label: 'Frontend authentication and role handling', lang: 'tsx' },
  { priority: 10, path: 'package.json', label: 'Dependencies and security risks', lang: 'json' }
];

let output = `# MAHAJOBS PLATFORM — CONSOLIDATED SECURITY AUDIT BUNDLE
Generated: ${new Date().toISOString()}
Target: Maharashtra Job Portal (MahaJobs)
Repository: mahajobs---maharashtra-job-portal

---

## TABLE OF CONTENTS

| # | Priority | File Path | Focus Area | Lines | Size |
|---|:---:|---|---|:---:|:---:|
`;

targetFiles.forEach((item, idx) => {
  const fullPath = path.resolve(item.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n').length;
    const bytes = fs.statSync(fullPath).size;
    output += `| ${idx + 1} | Priority ${item.priority} | [\`${item.path}\`](#file-${idx + 1}-${item.path.replace(/[^a-zA-Z0-9]/g, '-')}) | ${item.label} | ${lines} | ${(bytes / 1024).toFixed(1)} KB |\n`;
  } else {
    output += `| ${idx + 1} | Priority ${item.priority} | \`${item.path}\` | NOT FOUND | - | - |\n`;
  }
});

output += `\n---\n\n`;

targetFiles.forEach((item, idx) => {
  const fullPath = path.resolve(item.path);
  const fileAnchor = `file-${idx + 1}-${item.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
  output += `## <a id="${fileAnchor}"></a>FILE ${idx + 1} (Priority ${item.priority}): \`${item.path}\`\n`;
  output += `**Inspection Objective:** ${item.label}  \n`;
  output += `**Absolute Path:** \`${fullPath}\`  \n\n`;

  if (fs.existsSync(fullPath)) {
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    output += '```' + item.lang + '\n';
    output += fileContent;
    if (!fileContent.endsWith('\n')) output += '\n';
    output += '```\n\n';
  } else {
    output += `> [!WARNING] File not found at ${fullPath}\n\n`;
  }
  output += `---\n\n`;
});

const outputPath = path.resolve('SECURITY_AUDIT_CONSOLIDATED_BUNDLE.md');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Successfully generated bundle at: ${outputPath}`);
console.log(`Total Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

