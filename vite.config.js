
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

function copySiteFiles() {
  return {
    name: 'copy-site-files',
    closeBundle() {
      const outDir = path.join(rootDir, 'dist');

      const folders = [
        'css',
        'images',
        'Fonts',
        'js',
        'scripts',
        'admin',
      ];

      for (const folder of folders) {
        const source = path.join(rootDir, folder);
        const destination = path.join(outDir, folder);

        if (fs.existsSync(source)) {
          fs.cpSync(source, destination, {
            recursive: true,
            force: true,
          });
        }
      }

      const favicon = path.join(rootDir, 'favicon.ico');

      if (fs.existsSync(favicon)) {
        fs.copyFileSync(
          favicon,
          path.join(outDir, 'favicon.ico')
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copySiteFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
