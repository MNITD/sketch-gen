/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_merge_images__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ws_js__ = __webpack_require__(2);
/**
 * Created by bogdan on 09.02.18.
 */



let socket = new __WEBPACK_IMPORTED_MODULE_1__ws_js__["a" /* default */]();

// const merge = (images, options)=>{
//     //return mergeImages(['/body.png', '/eyes.png', '/mouth.png'])
//     return mergeImages(images, options);
// };

socket.subscribe('message', (event)=>{
    let data = JSON.parse(event.detail.getOriginalEvent().data);
    if(data.images)
        Object(__WEBPACK_IMPORTED_MODULE_0_merge_images__["a" /* default */])(data.images, data.options).then(b64=>{
            let img = document.createElement('img');
            img.src = b64;
            document.body.appendChild(img);
            socket.send({result: b64})})
});



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Defaults
var defaultOptions = {
	format: 'image/png',
	quality: 0.92,
	width: undefined,
	height: undefined,
	Canvas: undefined
};

// Return Promise
var mergeImages = function (sources, options) {
	if ( sources === void 0 ) sources = [];
	if ( options === void 0 ) options = {};

	return new Promise(function (resolve) {
	options = Object.assign({}, defaultOptions, options);

	// Setup browser/Node.js specific variables
	var canvas = options.Canvas ? new options.Canvas() : window.document.createElement('canvas');
	var Image = options.Canvas ? options.Canvas.Image : window.Image;
	if (options.Canvas) {
		options.quality *= 100;
	}

	// Load sources
	var images = sources.map(function (source) { return new Promise(function (resolve, reject) {
		// Convert sources to objects
		if (source.constructor.name !== 'Object') {
			source = { src: source };
		}

		// Resolve source and img when loaded
		var img = new Image();
		img.onerror = function () { return reject(new Error('Couldn\'t load image')); };
		img.onload = function () { return resolve(Object.assign({}, source, { img: img })); };
		img.src = source.src;
	}); });

	// Get canvas context
	var ctx = canvas.getContext('2d');

	// When sources have loaded
	resolve(Promise.all(images)
		.then(function (images) {
			// Set canvas dimensions
			var getSize = function (dim) { return options[dim] || Math.max.apply(Math, images.map(function (image) { return image.img[dim]; })); };
			canvas.width = getSize('width');
			canvas.height = getSize('height');

			// Draw images to canvas
			images.forEach(function (image) { return ctx.drawImage(image.img, image.x || 0, image.y || 0); });

			if (options.Canvas && options.format === 'image/jpeg') {
				// Resolve data URI for node-canvas jpeg async
				return new Promise(function (resolve) {
					canvas.toDataURL(options.format, {
						quality: options.quality,
						progressive: false
					}, function (err, jpeg) {
						if (err) {
							throw err;
						}
						resolve(jpeg);
					});
				});
			}

			// Resolve all other data URIs sync
			return canvas.toDataURL(options.format, options.quality);
		}));
});
};

/* harmony default export */ __webpack_exports__["a"] = (mergeImages);
//# sourceMappingURL=index.es2015.js.map


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Created by bogdan on 05.02.18.
 */

function Socket() {
    let socket = new WebSocket("ws://localhost:8080");

    const eventProvider = document.createElement('div');

    socket.addEventListener('message', (event) => {
        eventProvider.dispatchEvent(new CustomEvent('message', {
            detail: {
                getOriginalEvent: () => {
                    return event;
                }
            }
        }));
        console.log(event.data);
    });

    /* public methods */

    this.subscribe = (event, handler) => {
        eventProvider.addEventListener(event, handler);
    };

    this.unsubsctibe = (event, handler) => {
        eventProvider.removeEventListener(event, handler);
    };

    this.send = (msg)=>{
        socket.send(JSON.stringify(msg));
    };
}

/* harmony default export */ __webpack_exports__["a"] = (Socket);

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map