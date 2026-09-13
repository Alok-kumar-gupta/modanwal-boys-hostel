const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcDir = path.join(root, 'src');

// If main.tsx is in the root and NOT in src/main.tsx (i.e. flat upload)
if (!fs.existsSync(path.join(srcDir, 'main.tsx')) && fs.existsSync(path.join(root, 'main.tsx'))) {
  console.log('[Auto-Organize] Detected flat repository structure. Organizing files into src/...');

  const componentsDir = path.join(srcDir, 'components');
  const libDir = path.join(srcDir, 'lib');

  fs.mkdirSync(componentsDir, { recursive: true });
  fs.mkdirSync(libDir, { recursive: true });

  const libFiles = [
    'firebase.ts',
    'hostelService.ts',
    'pdfExportUtil.ts',
    'qrCodeUtil.ts',
    'rentEmailAutomation.ts',
    'seoManager.ts',
    'verificationUtil.ts'
  ];

  const srcRootFiles = [
    'App.tsx',
    'main.tsx',
    'index.css',
    'types.ts'
  ];

  libFiles.forEach(file => {
    const srcPath = path.join(root, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(libDir, file));
    }
  });

  srcRootFiles.forEach(file => {
    const srcPath = path.join(root, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(srcDir, file));
    }
  });

  const allRootFiles = fs.readdirSync(root);
  allRootFiles.forEach(file => {
    if (file.endsWith('.tsx') && file !== 'App.tsx' && file !== 'main.tsx') {
      fs.copyFileSync(path.join(root, file), path.join(componentsDir, file));
    }
  });

  console.log('[Auto-Organize] All files successfully arranged into src/! Proceeding with Vite build.');
}
