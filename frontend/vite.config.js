import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      /**
       * 백엔드 REST API 요청을 Spring Boot로 전달합니다.
       */
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },

      /**
       * 상품 참고 이미지 요청을 Spring Boot로 전달합니다.
       *
       * 예:
       * /uploads/products/파일명.jpg
       */
      '/uploads': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
});