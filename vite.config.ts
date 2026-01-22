
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 僅精準定義 API_KEY，避免破壞其他 process.env 屬性
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lunar-javascript', 'lucide-react']
        }
      }
    }
  }
});
