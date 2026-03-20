const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

function runWithRequestContext(requestId, fn) {
  return storage.run({ requestId }, fn);
}

function getRequestId() {
  return storage.getStore()?.requestId;
}

module.exports = { runWithRequestContext, getRequestId };

