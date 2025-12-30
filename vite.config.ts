
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Import process explicitly to resolve the type error: Property 'cwd' does not exist on type 'Process'
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load environment variables from the current directory. 
  // The third parameter '' allows loading variables that don't start with VITE_
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Maps process.env.API_KEY to the value of VITE_API_KEY or API_KEY from Render
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
    }
  };
});
