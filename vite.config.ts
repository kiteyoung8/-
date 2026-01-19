
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保只注入必要的 API_KEY，並提供空字串預設值以防環境中未定義
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  },
  resolve: {
    // 優化副檔名解析順序
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
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
