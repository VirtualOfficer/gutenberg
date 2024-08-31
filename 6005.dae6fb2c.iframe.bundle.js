"use strict";(globalThis.webpackChunkgutenberg=globalThis.webpackChunkgutenberg||[]).push([[6005],{"./packages/components/src/divider/component.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>component});var LOI6GHIP=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/__chunks/LOI6GHIP.js"),use_context_system=__webpack_require__("./packages/components/src/context/use-context-system.js"),context_connect=__webpack_require__("./packages/components/src/context/context-connect.ts"),emotion_styled_base_browser_esm=__webpack_require__("./node_modules/@emotion/styled/base/dist/emotion-styled-base.browser.esm.js"),emotion_react_browser_esm=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),space=__webpack_require__("./packages/components/src/utils/space.ts"),rtl=__webpack_require__("./packages/components/src/utils/rtl.js");const MARGIN_DIRECTIONS={vertical:{start:"marginLeft",end:"marginRight"},horizontal:{start:"marginTop",end:"marginBottom"}},renderMargin=({"aria-orientation":orientation="horizontal",margin,marginStart,marginEnd})=>(0,emotion_react_browser_esm.iv)((0,rtl.b)({[MARGIN_DIRECTIONS[orientation].start]:(0,space.D)(null!=marginStart?marginStart:margin),[MARGIN_DIRECTIONS[orientation].end]:(0,space.D)(null!=marginEnd?marginEnd:margin)})(),"","");var _ref={name:"1u4hpl4",styles:"display:inline"};const renderDisplay=({"aria-orientation":orientation="horizontal"})=>"vertical"===orientation?_ref:void 0,renderBorder=({"aria-orientation":orientation="horizontal"})=>(0,emotion_react_browser_esm.iv)({["vertical"===orientation?"borderRight":"borderBottom"]:"1px solid currentColor"},"",""),renderSize=({"aria-orientation":orientation="horizontal"})=>(0,emotion_react_browser_esm.iv)({height:"vertical"===orientation?"auto":0,width:"vertical"===orientation?0:"auto"},"",""),DividerView=(0,emotion_styled_base_browser_esm.Z)("hr",{target:"e19on6iw0"})("border:0;margin:0;",renderDisplay," ",renderBorder," ",renderSize," ",renderMargin,";");var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");function UnconnectedDivider(props,forwardedRef){const contextProps=(0,use_context_system.y)(props,"Divider");return(0,jsx_runtime.jsx)(LOI6GHIP.Z,{render:(0,jsx_runtime.jsx)(DividerView,{}),...contextProps,ref:forwardedRef})}UnconnectedDivider.displayName="UnconnectedDivider";const Divider=(0,context_connect.Iq)(UnconnectedDivider,"Divider"),component=Divider;try{Divider.displayName="Divider",Divider.__docgenInfo={description:"`Divider` is a layout component that separates groups of related content.\n\n```js\nimport {\n\t\t__experimentalDivider as Divider,\n\t\t__experimentalText as Text,\n\t\t__experimentalVStack as VStack,\n} from `@wordpress/components`;\n\nfunction Example() {\n\treturn (\n\t\t<VStack spacing={4}>\n\t\t\t<Text>Some text here</Text>\n\t\t\t<Divider />\n\t\t\t<Text>Some more text here</Text>\n\t\t</VStack>\n\t);\n}\n```",displayName:"Divider",props:{ref:{defaultValue:null,description:"Allows getting a ref to the component instance.\nOnce the component unmounts, React will set `ref.current` to `null`\n(or call the ref with `null` if you passed a callback ref).\n@see {@link https://react.dev/learn/referencing-values-with-refs#refs-and-the-dom React Docs}",name:"ref",required:!1,type:{name:"Ref<HTMLHRElement> & LegacyRef<any>"}},margin:{defaultValue:null,description:"Adjusts all margins on the inline dimension.\n\nCan either be a number (which will act as a multiplier to the library's grid system base of 4px),\nor a literal CSS value string.",name:"margin",required:!1,type:{name:"SpaceInput"}},marginEnd:{defaultValue:null,description:"Adjusts the inline-end margin.\n\nCan either be a number (which will act as a multiplier to the library's grid system base of 4px),\nor a literal CSS value string.",name:"marginEnd",required:!1,type:{name:"SpaceInput"}},marginStart:{defaultValue:null,description:"Adjusts the inline-start margin.\n\nCan either be a number (which will act as a multiplier to the library's grid system base of 4px),\nor a literal CSS value string.",name:"marginStart",required:!1,type:{name:"SpaceInput"}},orientation:{defaultValue:{value:"'horizontal'"},description:"Divider's orientation. When using inside a flex container, you may need\nto make sure the divider is `stretch` aligned in order for it to be\nvisible.",name:"orientation",required:!1,type:{name:"enum",value:[{value:'"horizontal"'},{value:'"vertical"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/divider/component.tsx#Divider"]={docgenInfo:Divider.__docgenInfo,name:"Divider",path:"packages/components/src/divider/component.tsx#Divider"})}catch(__react_docgen_typescript_loader_error){}},"./packages/components/src/flex/context.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{G:()=>FlexContext,f:()=>useFlexContext});var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const FlexContext=(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createContext)({flexItemDisplay:void 0}),useFlexContext=()=>(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useContext)(FlexContext)},"./packages/components/src/flex/flex/component.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _context__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./packages/components/src/context/context-connect.ts"),_hook__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/components/src/flex/flex/hook.ts"),_context__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./packages/components/src/flex/context.ts"),_view__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./packages/components/src/view/component.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/jsx-runtime.js");function UnconnectedFlex(props,forwardedRef){const{children,isColumn,...otherProps}=(0,_hook__WEBPACK_IMPORTED_MODULE_1__.k)(props);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_context__WEBPACK_IMPORTED_MODULE_2__.G.Provider,{value:{flexItemDisplay:isColumn?"block":void 0},children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_view__WEBPACK_IMPORTED_MODULE_3__.Z,{...otherProps,ref:forwardedRef,children})})}UnconnectedFlex.displayName="UnconnectedFlex";const Flex=(0,_context__WEBPACK_IMPORTED_MODULE_4__.Iq)(UnconnectedFlex,"Flex"),__WEBPACK_DEFAULT_EXPORT__=Flex;try{Flex.displayName="Flex",Flex.__docgenInfo={description:"`Flex` is a primitive layout component that adaptively aligns child content\nhorizontally or vertically. `Flex` powers components like `HStack` and\n`VStack`.\n\n`Flex` is used with any of its two sub-components, `FlexItem` and\n`FlexBlock`.\n\n```jsx\nimport { Flex, FlexBlock, FlexItem } from '@wordpress/components';\n\nfunction Example() {\n  return (\n    <Flex>\n      <FlexItem>\n        <p>Code</p>\n      </FlexItem>\n      <FlexBlock>\n        <p>Poetry</p>\n      </FlexBlock>\n    </Flex>\n  );\n}\n```",displayName:"Flex",props:{align:{defaultValue:{value:"'center'"},description:"Aligns children using CSS Flexbox `align-items`. Vertically aligns\ncontent if the `direction` is `row`, or horizontally aligns content if\nthe `direction` is `column`.",name:"align",required:!1,type:{name:"AlignItems"}},direction:{defaultValue:{value:"'row'"},description:"The direction flow of the children content can be adjusted with\n`direction`. `column` will align children vertically and `row` will align\nchildren horizontally.",name:"direction",required:!1,type:{name:"FlexDirection"}},expanded:{defaultValue:{value:"true"},description:"Expands to the maximum available width (if horizontal) or height (if\nvertical).",name:"expanded",required:!1,type:{name:"boolean"}},gap:{defaultValue:{value:"2"},description:"Spacing in between each child can be adjusted by using `gap`.\n\nCan either be a number (which will act as a multiplier to the library's\ngrid system base of 4px), or a literal CSS value string.",name:"gap",required:!1,type:{name:"SpaceInput"}},justify:{defaultValue:{value:"'space-between'"},description:"Horizontally aligns content if the `direction` is `row`, or vertically\naligns content if the `direction` is `column`.",name:"justify",required:!1,type:{name:"JustifyContent"}},wrap:{defaultValue:{value:"false"},description:"Determines if children should wrap.",name:"wrap",required:!1,type:{name:"boolean"}},children:{defaultValue:null,description:"The children elements.",name:"children",required:!0,type:{name:"ReactNode"}},isReversed:{defaultValue:null,description:"@deprecated",name:"isReversed",required:!1,type:{name:"boolean"}},as:{defaultValue:null,description:"The HTML element or React component to render the component as.",name:"as",required:!1,type:{name:'"symbol" | "object" | "select" | ComponentClass<any, any> | FunctionComponent<any> | "a" | "abbr" | "address" | "area" | "article" | "aside" | ... 524 more ... | ("view" & FunctionComponent<...>)'}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/flex/flex/component.tsx#Flex"]={docgenInfo:Flex.__docgenInfo,name:"Flex",path:"packages/components/src/flex/flex/component.tsx#Flex"})}catch(__react_docgen_typescript_loader_error){}},"./packages/components/src/flex/flex/hook.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{k:()=>useFlex});var _emotion_react__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),_wordpress_element__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/react/index.js"),_wordpress_deprecated__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./packages/deprecated/build-module/index.js"),_context__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/components/src/context/use-context-system.js"),_utils_use_responsive_value__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./packages/components/src/utils/use-responsive-value.ts"),_utils_space__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./packages/components/src/utils/space.ts"),_styles__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./packages/components/src/flex/styles.ts"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./packages/components/src/utils/hooks/use-cx.ts");function useFlex(props){const{align,className,direction:directionProp="row",expanded=!0,gap=2,justify="space-between",wrap=!1,...otherProps}=(0,_context__WEBPACK_IMPORTED_MODULE_1__.y)(function useDeprecatedProps(props){const{isReversed,...otherProps}=props;return void 0!==isReversed?((0,_wordpress_deprecated__WEBPACK_IMPORTED_MODULE_0__.Z)("Flex isReversed",{alternative:'Flex direction="row-reverse" or "column-reverse"',since:"5.9"}),{...otherProps,direction:isReversed?"row-reverse":"row"}):otherProps}(props),"Flex"),directionAsArray=Array.isArray(directionProp)?directionProp:[directionProp],direction=(0,_utils_use_responsive_value__WEBPACK_IMPORTED_MODULE_2__.V)(directionAsArray),isColumn="string"==typeof direction&&!!direction.includes("column"),cx=(0,_utils__WEBPACK_IMPORTED_MODULE_3__.I)();return{...otherProps,className:(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)((()=>{const base=(0,_emotion_react__WEBPACK_IMPORTED_MODULE_5__.iv)({alignItems:null!=align?align:isColumn?"normal":"center",flexDirection:direction,flexWrap:wrap?"wrap":void 0,gap:(0,_utils_space__WEBPACK_IMPORTED_MODULE_6__.D)(gap),justifyContent:justify,height:isColumn&&expanded?"100%":void 0,width:!isColumn&&expanded?"100%":void 0},"","");return cx(_styles__WEBPACK_IMPORTED_MODULE_7__.kC,base,isColumn?_styles__WEBPACK_IMPORTED_MODULE_7__.bg:_styles__WEBPACK_IMPORTED_MODULE_7__.h,className)}),[align,className,cx,direction,expanded,gap,isColumn,justify,wrap]),isColumn}}},"./packages/components/src/flex/styles.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Ge:()=>block,bg:()=>ItemsColumn,ck:()=>Item,h:()=>ItemsRow,kC:()=>Flex});const Flex={name:"zjik7",styles:"display:flex"},Item={name:"qgaee5",styles:"display:block;max-height:100%;max-width:100%;min-height:0;min-width:0"},block={name:"82a6rk",styles:"flex:1"},ItemsColumn={name:"13nosa1",styles:">*{min-height:0;}"},ItemsRow={name:"1pwxzk4",styles:">*{min-width:0;}"}},"./packages/components/src/utils/use-responsive-value.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{V:()=>useResponsiveValue});var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const breakpoints=["40em","52em","64em"],useBreakpointIndex=(options={})=>{const{defaultIndex=0}=options;if("number"!=typeof defaultIndex)throw new TypeError(`Default breakpoint index should be a number. Got: ${defaultIndex}, ${typeof defaultIndex}`);if(defaultIndex<0||defaultIndex>breakpoints.length-1)throw new RangeError(`Default breakpoint index out of range. Theme has ${breakpoints.length} breakpoints, got index ${defaultIndex}`);const[value,setValue]=(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(defaultIndex);return(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{const onResize=()=>{const newValue=breakpoints.filter((bp=>"undefined"!=typeof window&&window.matchMedia(`screen and (min-width: ${bp})`).matches)).length;value!==newValue&&setValue(newValue)};return onResize(),"undefined"!=typeof window&&window.addEventListener("resize",onResize),()=>{"undefined"!=typeof window&&window.removeEventListener("resize",onResize)}}),[value]),value};function useResponsiveValue(values,options={}){const index=useBreakpointIndex(options);if(!Array.isArray(values)&&"function"!=typeof values)return values;const array=values||[];return array[index>=array.length?array.length-1:index]}},"./packages/components/node_modules/@ariakit/react-core/esm/__chunks/LOI6GHIP.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>Separator,z:()=>useSeparator});var _HKOOKEDE_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/__chunks/HKOOKEDE.js"),_3YLGPPWQ_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/__chunks/3YLGPPWQ.js"),useSeparator=(0,_HKOOKEDE_js__WEBPACK_IMPORTED_MODULE_0__.Bi)((function useSeparator2(_a){var _b=_a,{orientation="horizontal"}=_b,props=(0,_3YLGPPWQ_js__WEBPACK_IMPORTED_MODULE_1__.S0)(_b,["orientation"]);return props=(0,_3YLGPPWQ_js__WEBPACK_IMPORTED_MODULE_1__.ih)({role:"separator","aria-orientation":orientation},props)})),Separator=(0,_HKOOKEDE_js__WEBPACK_IMPORTED_MODULE_0__.Gp)((function Separator2(props){const htmlProps=useSeparator(props);return(0,_HKOOKEDE_js__WEBPACK_IMPORTED_MODULE_0__.az)("hr",htmlProps)}))}}]);