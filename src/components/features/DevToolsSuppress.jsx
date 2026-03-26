'use client';

import { useEffect } from 'react';

export default function DevToolsSuppress() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Suppress disable-devtools warning
      const originalError = console.error;
      console.error = function(...args) {
        if (args[0]?.includes?.('disable-devtool') || args[0]?.includes?.('Console was cleared')) {
          return; // Suppress this message
        }
        originalError.apply(console, args);
      };
    }
  }, []);

  return null;
}
