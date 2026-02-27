import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('%c IRONMATCH BOOTED v2.0.4 ', 'background: #32FF32; color: #000; font-weight: bold; padding: 4px;');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
