import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AppRoutes } from './routes';

export function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AppRoutes />
            </ThemeProvider>
        </BrowserRouter>
    );
}
