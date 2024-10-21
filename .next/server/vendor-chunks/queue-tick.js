/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/queue-tick";
exports.ids = ["vendor-chunks/queue-tick"];
exports.modules = {

/***/ "(rsc)/./node_modules/queue-tick/process-next-tick.js":
/*!******************************************************!*\
  !*** ./node_modules/queue-tick/process-next-tick.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = (typeof process !== 'undefined' && typeof process.nextTick === 'function')\n  ? process.nextTick.bind(process)\n  : __webpack_require__(/*! ./queue-microtask */ \"(rsc)/./node_modules/queue-tick/queue-microtask.js\")\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvcXVldWUtdGljay9wcm9jZXNzLW5leHQtdGljay5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0EsSUFBSSxtQkFBTyxDQUFDLDZFQUFtQiIsInNvdXJjZXMiOlsid2VicGFjazovL29tbmljbG9uZS1hcGktMi8uL25vZGVfbW9kdWxlcy9xdWV1ZS10aWNrL3Byb2Nlc3MtbmV4dC10aWNrLmpzPzhhOTUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKVxuICA/IHByb2Nlc3MubmV4dFRpY2suYmluZChwcm9jZXNzKVxuICA6IHJlcXVpcmUoJy4vcXVldWUtbWljcm90YXNrJylcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/queue-tick/process-next-tick.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/queue-tick/queue-microtask.js":
/*!****************************************************!*\
  !*** ./node_modules/queue-tick/queue-microtask.js ***!
  \****************************************************/
/***/ ((module) => {

eval("module.exports = typeof queueMicrotask === 'function' ? queueMicrotask : (fn) => Promise.resolve().then(fn)\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvcXVldWUtdGljay9xdWV1ZS1taWNyb3Rhc2suanMiLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vbW5pY2xvbmUtYXBpLTIvLi9ub2RlX21vZHVsZXMvcXVldWUtdGljay9xdWV1ZS1taWNyb3Rhc2suanM/NDkxZiJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBxdWV1ZU1pY3JvdGFzayA9PT0gJ2Z1bmN0aW9uJyA/IHF1ZXVlTWljcm90YXNrIDogKGZuKSA9PiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZuKVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/queue-tick/queue-microtask.js\n");

/***/ })

};
;