const sendLog = (level, message, meta) => {
  fetch('/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ level, message, ...meta }),
  }).catch(console.error); // Log to console if logging to server fails
};

const logger = {
  log: (message, meta) => sendLog('log', message, meta),
  error: (message, meta) => sendLog('error', message, meta),
};

export default logger;
