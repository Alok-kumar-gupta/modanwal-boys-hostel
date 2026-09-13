import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-heal flat root uploads for seamless Vercel deployments
const srcDir = path.resolve(__dirname, 'src');
const mainFileInRoot = path.resolve(__dirname, 'main.tsx');
if (!fs.existsSync(path.join(srcDir, 'main.tsx')) && fs.existsSync(mainFileInRoot)) {
  const componentsDir = path.join(srcDir, 'components');
  const libDir = path.join(srcDir, 'lib');
  fs.mkdirSync(componentsDir, { recursive: true });
  fs.mkdirSync(libDir, { recursive: true });

  const libFiles = [
    'firebase.ts', 'hostelService.ts', 'pdfExportUtil.ts',
    'qrCodeUtil.ts', 'rentEmailAutomation.ts', 'seoManager.ts', 'verificationUtil.ts'
  ];
  const srcRootFiles = ['App.tsx', 'main.tsx', 'index.css', 'types.ts'];

  libFiles.forEach(f => {
    const p = path.resolve(__dirname, f);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(libDir, f));
  });
  srcRootFiles.forEach(f => {
    const p = path.resolve(__dirname, f);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(srcDir, f));
  });
  fs.readdirSync(__dirname).forEach(f => {
    if (f.endsWith('.tsx') && f !== 'App.tsx' && f !== 'main.tsx') {
      fs.copyFileSync(path.resolve(__dirname, f), path.join(componentsDir, f));
    }
  });
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
