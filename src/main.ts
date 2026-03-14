// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  createApp(App).mount('#app');
}

bootstrap();
