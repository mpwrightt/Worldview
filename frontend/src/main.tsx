import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider } from "convex/react";
import { convex } from "./lib/convex";
import App from './App'
import './index.css'

// Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
)
