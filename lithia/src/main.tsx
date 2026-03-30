import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';
import App from './App.tsx';
import { uoTheme } from './theme';
import { NotesFsProvider } from './context/NotesFsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={uoTheme}>
      <NotesFsProvider>
        <App />
      </NotesFsProvider>
    </MantineProvider>
  </StrictMode>
);
