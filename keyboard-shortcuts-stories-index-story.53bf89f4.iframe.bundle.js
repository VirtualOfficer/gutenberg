(globalThis.webpackChunkgutenberg=globalThis.webpackChunkgutenberg||[]).push([[8953],{"./packages/keycodes/build-module/platform.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";function isAppleOS(_window=null){if(!_window){if("undefined"==typeof window)return!1;_window=window}const{platform}=_window.navigator;return-1!==platform.indexOf("Mac")||["iPad","iPhone"].includes(platform)}__webpack_require__.d(__webpack_exports__,{R:()=>isAppleOS})},"./node_modules/mousetrap/mousetrap.js":(module,exports,__webpack_require__)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(window,document,undefined){if(window){for(var _REVERSE_MAP,_MAP={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},_KEYCODE_MAP={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},_SHIFT_MAP={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},_SPECIAL_ALIASES={option:"alt",command:"meta",return:"enter",escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},i=1;i<20;++i)_MAP[111+i]="f"+i;for(i=0;i<=9;++i)_MAP[i+96]=i.toString();Mousetrap.prototype.bind=function(keys,callback,action){return keys=keys instanceof Array?keys:[keys],this._bindMultiple.call(this,keys,callback,action),this},Mousetrap.prototype.unbind=function(keys,action){return this.bind.call(this,keys,(function(){}),action)},Mousetrap.prototype.trigger=function(keys,action){return this._directMap[keys+":"+action]&&this._directMap[keys+":"+action]({},keys),this},Mousetrap.prototype.reset=function(){return this._callbacks={},this._directMap={},this},Mousetrap.prototype.stopCallback=function(e,element){if((" "+element.className+" ").indexOf(" mousetrap ")>-1)return!1;if(_belongsTo(element,this.target))return!1;if("composedPath"in e&&"function"==typeof e.composedPath){var initialEventTarget=e.composedPath()[0];initialEventTarget!==e.target&&(element=initialEventTarget)}return"INPUT"==element.tagName||"SELECT"==element.tagName||"TEXTAREA"==element.tagName||element.isContentEditable},Mousetrap.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)},Mousetrap.addKeycodes=function(object){for(var key in object)object.hasOwnProperty(key)&&(_MAP[key]=object[key]);_REVERSE_MAP=null},Mousetrap.init=function(){var documentMousetrap=Mousetrap(document);for(var method in documentMousetrap)"_"!==method.charAt(0)&&(Mousetrap[method]=function(method){return function(){return documentMousetrap[method].apply(documentMousetrap,arguments)}}(method))},Mousetrap.init(),window.Mousetrap=Mousetrap,module.exports&&(module.exports=Mousetrap),void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return Mousetrap}.call(exports,__webpack_require__,exports,module))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}function _addEvent(object,type,callback){object.addEventListener?object.addEventListener(type,callback,!1):object.attachEvent("on"+type,callback)}function _characterFromEvent(e){if("keypress"==e.type){var character=String.fromCharCode(e.which);return e.shiftKey||(character=character.toLowerCase()),character}return _MAP[e.which]?_MAP[e.which]:_KEYCODE_MAP[e.which]?_KEYCODE_MAP[e.which]:String.fromCharCode(e.which).toLowerCase()}function _isModifier(key){return"shift"==key||"ctrl"==key||"alt"==key||"meta"==key}function _pickBestAction(key,modifiers,action){return action||(action=function _getReverseMap(){if(!_REVERSE_MAP)for(var key in _REVERSE_MAP={},_MAP)key>95&&key<112||_MAP.hasOwnProperty(key)&&(_REVERSE_MAP[_MAP[key]]=key);return _REVERSE_MAP}()[key]?"keydown":"keypress"),"keypress"==action&&modifiers.length&&(action="keydown"),action}function _getKeyInfo(combination,action){var keys,key,i,modifiers=[];for(keys=function _keysFromString(combination){return"+"===combination?["+"]:(combination=combination.replace(/\+{2}/g,"+plus")).split("+")}(combination),i=0;i<keys.length;++i)key=keys[i],_SPECIAL_ALIASES[key]&&(key=_SPECIAL_ALIASES[key]),action&&"keypress"!=action&&_SHIFT_MAP[key]&&(key=_SHIFT_MAP[key],modifiers.push("shift")),_isModifier(key)&&modifiers.push(key);return{key,modifiers,action:action=_pickBestAction(key,modifiers,action)}}function _belongsTo(element,ancestor){return null!==element&&element!==document&&(element===ancestor||_belongsTo(element.parentNode,ancestor))}function Mousetrap(targetElement){var self=this;if(targetElement=targetElement||document,!(self instanceof Mousetrap))return new Mousetrap(targetElement);self.target=targetElement,self._callbacks={},self._directMap={};var _resetTimer,_sequenceLevels={},_ignoreNextKeyup=!1,_ignoreNextKeypress=!1,_nextExpectedAction=!1;function _resetSequences(doNotReset){doNotReset=doNotReset||{};var key,activeSequences=!1;for(key in _sequenceLevels)doNotReset[key]?activeSequences=!0:_sequenceLevels[key]=0;activeSequences||(_nextExpectedAction=!1)}function _getMatches(character,modifiers,e,sequenceName,combination,level){var i,callback,modifiers1,modifiers2,matches=[],action=e.type;if(!self._callbacks[character])return[];for("keyup"==action&&_isModifier(character)&&(modifiers=[character]),i=0;i<self._callbacks[character].length;++i)if(callback=self._callbacks[character][i],(sequenceName||!callback.seq||_sequenceLevels[callback.seq]==callback.level)&&action==callback.action&&("keypress"==action&&!e.metaKey&&!e.ctrlKey||(modifiers1=modifiers,modifiers2=callback.modifiers,modifiers1.sort().join(",")===modifiers2.sort().join(",")))){var deleteCombo=!sequenceName&&callback.combo==combination,deleteSequence=sequenceName&&callback.seq==sequenceName&&callback.level==level;(deleteCombo||deleteSequence)&&self._callbacks[character].splice(i,1),matches.push(callback)}return matches}function _fireCallback(callback,e,combo,sequence){self.stopCallback(e,e.target||e.srcElement,combo,sequence)||!1===callback(e,combo)&&(!function _preventDefault(e){e.preventDefault?e.preventDefault():e.returnValue=!1}(e),function _stopPropagation(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0}(e))}function _handleKeyEvent(e){"number"!=typeof e.which&&(e.which=e.keyCode);var character=_characterFromEvent(e);character&&("keyup"!=e.type||_ignoreNextKeyup!==character?self.handleKey(character,function _eventModifiers(e){var modifiers=[];return e.shiftKey&&modifiers.push("shift"),e.altKey&&modifiers.push("alt"),e.ctrlKey&&modifiers.push("ctrl"),e.metaKey&&modifiers.push("meta"),modifiers}(e),e):_ignoreNextKeyup=!1)}function _bindSequence(combo,keys,callback,action){function _increaseSequence(nextAction){return function(){_nextExpectedAction=nextAction,++_sequenceLevels[combo],function _resetSequenceTimer(){clearTimeout(_resetTimer),_resetTimer=setTimeout(_resetSequences,1e3)}()}}function _callbackAndReset(e){_fireCallback(callback,e,combo),"keyup"!==action&&(_ignoreNextKeyup=_characterFromEvent(e)),setTimeout(_resetSequences,10)}_sequenceLevels[combo]=0;for(var i=0;i<keys.length;++i){var wrappedCallback=i+1===keys.length?_callbackAndReset:_increaseSequence(action||_getKeyInfo(keys[i+1]).action);_bindSingle(keys[i],wrappedCallback,action,combo,i)}}function _bindSingle(combination,callback,action,sequenceName,level){self._directMap[combination+":"+action]=callback;var info,sequence=(combination=combination.replace(/\s+/g," ")).split(" ");sequence.length>1?_bindSequence(combination,sequence,callback,action):(info=_getKeyInfo(combination,action),self._callbacks[info.key]=self._callbacks[info.key]||[],_getMatches(info.key,info.modifiers,{type:info.action},sequenceName,combination,level),self._callbacks[info.key][sequenceName?"unshift":"push"]({callback,modifiers:info.modifiers,action:info.action,seq:sequenceName,level,combo:combination}))}self._handleKey=function(character,modifiers,e){var i,callbacks=_getMatches(character,modifiers,e),doNotReset={},maxLevel=0,processedSequenceCallback=!1;for(i=0;i<callbacks.length;++i)callbacks[i].seq&&(maxLevel=Math.max(maxLevel,callbacks[i].level));for(i=0;i<callbacks.length;++i)if(callbacks[i].seq){if(callbacks[i].level!=maxLevel)continue;processedSequenceCallback=!0,doNotReset[callbacks[i].seq]=1,_fireCallback(callbacks[i].callback,e,callbacks[i].combo,callbacks[i].seq)}else processedSequenceCallback||_fireCallback(callbacks[i].callback,e,callbacks[i].combo);var ignoreThisKeypress="keypress"==e.type&&_ignoreNextKeypress;e.type!=_nextExpectedAction||_isModifier(character)||ignoreThisKeypress||_resetSequences(doNotReset),_ignoreNextKeypress=processedSequenceCallback&&"keydown"==e.type},self._bindMultiple=function(combinations,callback,action){for(var i=0;i<combinations.length;++i)_bindSingle(combinations[i],callback,action)},_addEvent(targetElement,"keypress",_handleKeyEvent),_addEvent(targetElement,"keydown",_handleKeyEvent),_addEvent(targetElement,"keyup",_handleKeyEvent)}}("undefined"!=typeof window?window:null,"undefined"!=typeof window?document:null)},"./node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.js":()=>{!function(Mousetrap){if(Mousetrap){var _globalCallbacks={},_originalStopCallback=Mousetrap.prototype.stopCallback;Mousetrap.prototype.stopCallback=function(e,element,combo,sequence){return!!this.paused||!_globalCallbacks[combo]&&!_globalCallbacks[sequence]&&_originalStopCallback.call(this,e,element,combo)},Mousetrap.prototype.bindGlobal=function(keys,callback,action){if(this.bind(keys,callback,action),keys instanceof Array)for(var i=0;i<keys.length;i++)_globalCallbacks[keys[i]]=!0;else _globalCallbacks[keys]=!0},Mousetrap.init()}}("undefined"!=typeof Mousetrap?Mousetrap:void 0)},"./packages/components/src/keyboard-shortcuts/stories/index.story.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,default:()=>index_story});var react=__webpack_require__("./node_modules/react/index.js"),mousetrap_mousetrap=__webpack_require__("./node_modules/mousetrap/mousetrap.js"),mousetrap_default=__webpack_require__.n(mousetrap_mousetrap),platform=(__webpack_require__("./node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.js"),__webpack_require__("./packages/keycodes/build-module/platform.js"));const use_keyboard_shortcut=function useKeyboardShortcut(shortcuts,callback,{bindGlobal=!1,eventName="keydown",isDisabled=!1,target}={}){const currentCallbackRef=(0,react.useRef)(callback);(0,react.useEffect)((()=>{currentCallbackRef.current=callback}),[callback]),(0,react.useEffect)((()=>{if(isDisabled)return;const mousetrap=new(mousetrap_default())(target&&target.current?target.current:document);return(Array.isArray(shortcuts)?shortcuts:[shortcuts]).forEach((shortcut=>{const keys=shortcut.split("+"),modifiers=new Set(keys.filter((value=>value.length>1))),hasAlt=modifiers.has("alt"),hasShift=modifiers.has("shift");if((0,platform.R)()&&(1===modifiers.size&&hasAlt||2===modifiers.size&&hasAlt&&hasShift))throw new Error(`Cannot bind ${shortcut}. Alt and Shift+Alt modifiers are reserved for character input.`);mousetrap[bindGlobal?"bindGlobal":"bind"](shortcut,((...args)=>currentCallbackRef.current(...args)),eventName)})),()=>{mousetrap.reset()}}),[shortcuts,bindGlobal,eventName,target,isDisabled])};var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");function KeyboardShortcut({target,callback,shortcut,bindGlobal,eventName}){return use_keyboard_shortcut(shortcut,callback,{bindGlobal,target,eventName}),null}function KeyboardShortcuts({children,shortcuts,bindGlobal,eventName}){const target=(0,react.useRef)(null),element=Object.entries(null!=shortcuts?shortcuts:{}).map((([shortcut,callback])=>(0,jsx_runtime.jsx)(KeyboardShortcut,{shortcut,callback,bindGlobal,eventName,target},shortcut)));return react.Children.count(children)?(0,jsx_runtime.jsxs)("div",{ref:target,children:[element,children]}):(0,jsx_runtime.jsx)(jsx_runtime.Fragment,{children:element})}KeyboardShortcuts.displayName="KeyboardShortcuts";const keyboard_shortcuts=KeyboardShortcuts;try{KeyboardShortcuts.displayName="KeyboardShortcuts",KeyboardShortcuts.__docgenInfo={description:"`KeyboardShortcuts` is a component which handles keyboard sequences during the lifetime of the rendering element.\n\nWhen passed children, it will capture key events which occur on or within the children. If no children are passed, events are captured on the document.\n\nIt uses the [Mousetrap](https://craig.is/killing/mice) library to implement keyboard sequence bindings.\n\n```jsx\nimport { KeyboardShortcuts } from '@wordpress/components';\nimport { useState } from '@wordpress/element';\n\nconst MyKeyboardShortcuts = () => {\n\tconst [ isAllSelected, setIsAllSelected ] = useState( false );\n\tconst selectAll = () => {\n\t\tsetIsAllSelected( true );\n\t};\n\n\treturn (\n\t\t<div>\n\t\t\t<KeyboardShortcuts\n\t\t\t\tshortcuts={ {\n\t\t\t\t\t'mod+a': selectAll,\n\t\t\t\t} }\n\t\t\t/>\n\t\t\t[cmd/ctrl + A] Combination pressed? { isAllSelected ? 'Yes' : 'No' }\n\t\t</div>\n\t);\n};\n```",displayName:"KeyboardShortcuts",props:{children:{defaultValue:null,description:"Elements to render, upon whom key events are to be monitored.",name:"children",required:!1,type:{name:"ReactNode"}},shortcuts:{defaultValue:null,description:"An object of shortcut bindings, where each key is a keyboard combination,\nthe value of which is the callback to be invoked when the key combination is pressed.\n\nThe value of each shortcut should be a consistent function reference, not an anonymous function.\nOtherwise, the callback will not be correctly unbound when the component unmounts.\n\nThe `KeyboardShortcuts` component will not update to reflect a changed `shortcuts` prop.\nIf you need to change shortcuts, mount a separate `KeyboardShortcuts` element,\nwhich can be achieved by assigning a unique `key` prop.\n@see {@link https://craig.is/killing/mice Mousetrap documentation}",name:"shortcuts",required:!0,type:{name:"Record<string, (event: ExtendedKeyboardEvent, combo: string) => void>"}},bindGlobal:{defaultValue:null,description:"By default, a callback will not be invoked if the key combination occurs in an editable field.\nPass `bindGlobal` as `true` if the key events should be observed globally, including within editable fields.\n\nTip: If you need some but not all keyboard events to be observed globally,\nsimply render two distinct `KeyboardShortcuts` elements, one with and one without the `bindGlobal` prop.",name:"bindGlobal",required:!1,type:{name:"boolean"}},eventName:{defaultValue:null,description:"By default, a callback is invoked in response to the `keydown` event.\nTo override this, pass `eventName` with the name of a specific keyboard event.",name:"eventName",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/keyboard-shortcuts/index.tsx#KeyboardShortcuts"]={docgenInfo:KeyboardShortcuts.__docgenInfo,name:"KeyboardShortcuts",path:"packages/components/src/keyboard-shortcuts/index.tsx#KeyboardShortcuts"})}catch(__react_docgen_typescript_loader_error){}const index_story={component:keyboard_shortcuts,title:"Components/KeyboardShortcuts",parameters:{sourceLink:"packages/components/src/keyboard-shortcuts",badges:[],controls:{expanded:!0},docs:{canvas:{sourceState:"shown"}}}},Template=props=>(0,jsx_runtime.jsx)(keyboard_shortcuts,{...props});Template.displayName="Template";const Default=Template.bind({});Default.args={shortcuts:{a:()=>window.alert('You hit "a"!'),b:()=>window.alert('You hit "b"!')},children:(0,jsx_runtime.jsxs)("div",{children:[(0,jsx_runtime.jsx)("p",{children:'Hit the "a" or "b" key in this textarea:'}),(0,jsx_runtime.jsx)("textarea",{})]})},Default.parameters={docs:{source:{code:'\n<KeyboardShortcuts\n  shortcuts={{\n    a: () => window.alert(\'You hit "a"!\'),\n    b: () => window.alert(\'You hit "b"!\'),\n  }}\n>\n  <div>\n    <p>\n      Hit the "a" or "b" key in this textarea:\n    </p>\n    <textarea />\n  </div>\n</KeyboardShortcuts>\n            '}}},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"props => <KeyboardShortcuts {...props} />",...Default.parameters?.docs?.source}}}}}]);