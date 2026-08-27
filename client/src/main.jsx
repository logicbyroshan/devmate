import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import '../public/static/css/styles.css';
import '../public/static/css/responsive.css';
import '../public/static/css/about.css';
import '../public/static/css/technology.css';
import '../public/static/css/projects.css';
import '../public/static/css/roadmap.css';
import '../public/static/css/blog.css';
import '../public/static/css/faq.css';
import '../public/static/css/contact.css';
import '../public/static/css/footer.css';
import '../public/static/css/modal.css';
import '../public/static/css/pages.css';
import '../public/static/css/doc-engine.css';
import 'katex/dist/katex.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactLenis root options={{ lerp: 0.06, wheelMultiplier: 1.2 }}>
    <App />
  </ReactLenis>
);
