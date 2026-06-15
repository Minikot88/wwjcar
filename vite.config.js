import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_PORT = 5180;

function parsePort(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const port = parsePort(env.VITE_PORT);

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: false
    },
    preview: {
      port,
      strictPort: false
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }

            if (id.includes('@mui/icons-material')) {
              return 'vendor-mui-icons';
            }

            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }

            return 'vendor';
          }
        }
      }
    }
  };
});
