import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:5000',
				changeOrigin: true,
			},
			'/ws': {
				target: 'ws://localhost:5000',
				ws: true,
			},
		},
	},
	build: {
		outDir: 'dist',
		sourcemap: true,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					three: ['three', '@react-three/fiber', '@react-three/drei'],
					ui: ['axios', 'socket.io-client', 'react-router-dom'],
				},
			},
		},
	},
	optimizeDeps: {
		exclude: ['three-mesh-bvh'],
	},
});
