
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保在 Vercel 建置期間 API_KEY 能被正確替換為字串
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  resolve: {
    alias: {
      // 確保路徑解析正確
      '@': '/src',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 讓 Vite 自動處理分包，避免手動配置引起的路徑錯誤
        manualChunks: undefined 
      }
    }
  }
});
