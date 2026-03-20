'use client';

import { useEffect } from 'react';

export function ConsoleWarningSuppressor() {
  useEffect(() => {
    const originalWarn = console.warn;
    const originalLog = console.log;

    const filterWarnings = (msg: any, ...args: any[]) => {
      if (typeof msg === 'string') {
        const suppressedWarnings = [
          'Clerk has been loaded with development keys',
          'The prop "redirectUrl" is deprecated',
          'THREE.THREE.Clock: This module has been deprecated',
          'THREE.Clock',
        ];

        // Check if the message contains any of the suppressed substrings
        if (suppressedWarnings.some((warning) => msg.includes(warning))) {
          return;
        }
      }
      originalWarn(msg, ...args);
    };

    console.warn = filterWarnings;
    
    // Sometimes they log as standard logs or errors, let's also filter log just in case
    const filterLogs = (msg: any, ...args: any[]) => {
      if (typeof msg === 'string') {
        const suppressedWarnings = [
          'Clerk has been loaded with development keys',
          'The prop "redirectUrl" is deprecated',
          'THREE.THREE.Clock: This module has been deprecated',
          'THREE.Clock',
        ];

        if (suppressedWarnings.some((warning) => msg.includes(warning))) {
          return;
        }
      }
      originalLog(msg, ...args);
    };
    
    console.log = filterLogs;

    return () => {
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  return null;
}
