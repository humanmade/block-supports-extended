!function(){"use strict";function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(t,r,n){return o=function(t,r){if("object"!=e(t)||!t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var o=n.call(t,"string");if("object"!=e(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(r),(r="symbol"==e(o)?o:String(o))in t?Object.defineProperty(t,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[r]=n,t;var o}function r(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function n(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,o,l,i,c=[],u=!0,a=!1;try{if(l=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;u=!1}else for(;!(u=(n=l.call(r)).done)&&(c.push(n.value),c.length!==t);u=!0);}catch(e){a=!0,o=e}finally{try{if(!u&&null!=r.return&&(i=r.return(),Object(i)!==i))return}finally{if(a)throw o}}return c}}(e,t)||function(e,t){if(e){if("string"==typeof e)return r(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var o,l=window.React,i=window.wp.element,c=window.wp.i18n,u=window.wp.data,a=window.wp.hooks,s=window.wp.compose,p=window.wp.blockEditor;function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function f(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?d(Object(n),!0).forEach((function(r){t(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):d(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var b=new window.CSSStyleSheet;document.adoptedStyleSheets.push(b);var y={text:"color",background:"background-color",gradient:"background"},m=(null===(o=window.blockSupportsExtended)||void 0===o?void 0:o.color)||{};Object.entries(m).forEach((function(e){var r=n(e,2),o=r[0],d=r[1],m=(0,s.compose)((0,p.withColors)(t({},o,o)),(0,s.createHigherOrderComponent)((function(e){return function(r){var a,s,m=r.clientId,w=r.name,v=r.attributes,g=r.setAttributes,S=r[o],h=r["set".concat(o.substring(0,1).toUpperCase()).concat(o.substring(1))];if(!(0,u.useSelect)((function(e){var t=e("core/blocks").getBlockSupport(w,"color");return t&&t[o]}),[w]))return(0,l.createElement)(e,f({},r));var O=(0,p.__experimentalUseMultipleOriginColorsAndGradients)(),j=(null==S?void 0:S.color)||(null==v||null===(a=v.style)||void 0===a?void 0:a.elements)&&(null==v||null===(s=v.style)||void 0===s||null===(s=s.elements[o])||void 0===s?void 0:s.color[d.property])||"",C=d.default||"",E=(0,p.useBlockProps)().className.match(/wp-elements-(\d+)/),P=E&&E[1]?parseInt(E[1],10):"",k=n((0,i.useState)(null),2),I=k[0],A=k[1];return(0,i.useEffect)((function(){var e=(0,c.sprintf)("".concat(d.selector," { ").concat(y[d.property]||"color",": ").concat(j||C,"; }"),"wp-elements-".concat(P));if(null!==I)b.deleteRule(I),b.insertRule(e,I);else{var t=b.cssRules.length;b.insertRule(e,t),A(t)}}),[j,C,P,I,A]),(0,l.createElement)(l.Fragment,null,(0,l.createElement)(e,f({},r)),(0,l.createElement)(p.InspectorControls,{group:"color"},(0,l.createElement)(p.__experimentalColorGradientSettingsDropdown,f({settings:[{label:d.label,colorValue:j,onColorChange:function(e){var r;h(e),g({style:f(f({},(null==v?void 0:v.style)||{}),{},{elements:f(f({},(null==v||null===(r=v.style)||void 0===r?void 0:r.elements)||{}),{},t({},o,{color:t({},d.property,e)}))})})}}],panelId:m,hasColorsOrGradients:!1,disableCustomColors:!1,__experimentalIsRenderedInSidebar:!0},O))))}}),"withPseudoContentColorUI"));wp.domReady((function(){(0,a.addFilter)("editor.BlockEdit","block-supports-extended/".concat(o),m)}))}))}();