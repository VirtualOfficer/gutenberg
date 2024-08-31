"use strict";(globalThis.webpackChunkgutenberg=globalThis.webpackChunkgutenberg||[]).push([[3051],{"./packages/components/src/utils/math.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function getNumber(value){const number=Number(value);return isNaN(number)?0:number}function add(...args){return args.reduce(((sum,arg)=>sum+getNumber(arg)),0)}function subtract(...args){return args.reduce(((diff,arg,index)=>{const value=getNumber(arg);return 0===index?value:diff-value}),0)}function clamp(value,min,max){const baseValue=getNumber(value);return Math.max(min,Math.min(baseValue,max))}function roundClamp(value=0,min=1/0,max=1/0,step=1){const baseValue=getNumber(value),stepValue=getNumber(step),precision=function getPrecision(value){const split=(value+"").split(".");return void 0!==split[1]?split[1].length:0}(step),clampedValue=clamp(Math.round(baseValue/stepValue)*stepValue,min,max);return precision?getNumber(clampedValue.toFixed(precision)):clampedValue}__webpack_require__.d(__webpack_exports__,{$X:()=>subtract,IH:()=>add,Pc:()=>roundClamp,uZ:()=>clamp})},"./packages/icons/build-module/library/plus.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/primitives/build-module/svg/index.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Wj,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.y$,{d:"M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z"})})},"./packages/icons/build-module/library/reset.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/primitives/build-module/svg/index.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Wj,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.y$,{d:"M7 11.5h10V13H7z"})})},"./packages/components/src/h-stack/component.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _context__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./packages/components/src/context/context-connect.ts"),_view__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./packages/components/src/view/component.tsx"),_hook__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/components/src/h-stack/hook.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/jsx-runtime.js");function UnconnectedHStack(props,forwardedRef){const hStackProps=(0,_hook__WEBPACK_IMPORTED_MODULE_1__.R)(props);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_view__WEBPACK_IMPORTED_MODULE_2__.Z,{...hStackProps,ref:forwardedRef})}UnconnectedHStack.displayName="UnconnectedHStack";const HStack=(0,_context__WEBPACK_IMPORTED_MODULE_3__.Iq)(UnconnectedHStack,"HStack"),__WEBPACK_DEFAULT_EXPORT__=HStack;try{HStack.displayName="HStack",HStack.__docgenInfo={description:"`HStack` (Horizontal Stack) arranges child elements in a horizontal line.\n\n`HStack` can render anything inside.\n\n```jsx\nimport {\n\t__experimentalHStack as HStack,\n\t__experimentalText as Text,\n} from `@wordpress/components`;\n\nfunction Example() {\n\treturn (\n\t\t<HStack>\n\t\t\t<Text>Code</Text>\n\t\t\t<Text>is</Text>\n\t\t\t<Text>Poetry</Text>\n\t\t</HStack>\n\t);\n}\n```",displayName:"HStack",props:{children:{defaultValue:null,description:"The children elements.",name:"children",required:!0,type:{name:"ReactNode"}},direction:{defaultValue:{value:"'row'"},description:"The direction flow of the children content can be adjusted with\n`direction`. `column` will align children vertically and `row` will align\nchildren horizontally.",name:"direction",required:!1,type:{name:"FlexDirection"}},wrap:{defaultValue:{value:"false"},description:"Determines if children should wrap.",name:"wrap",required:!1,type:{name:"boolean"}},isReversed:{defaultValue:null,description:"@deprecated",name:"isReversed",required:!1,type:{name:"boolean"}},justify:{defaultValue:{value:"'space-between'"},description:"Horizontally aligns content if the `direction` is `row`, or vertically\naligns content if the `direction` is `column`.",name:"justify",required:!1,type:{name:"JustifyContent"}},expanded:{defaultValue:{value:"true"},description:"Expands to the maximum available width (if horizontal) or height (if\nvertical).",name:"expanded",required:!1,type:{name:"boolean"}},alignment:{defaultValue:{value:"'edge'"},description:"Determines how the child elements are aligned.\n\n* `top`: Aligns content to the top.\n* `topLeft`: Aligns content to the top/left.\n* `topRight`: Aligns content to the top/right.\n* `left`: Aligns content to the left.\n* `center`: Aligns content to the center.\n* `right`: Aligns content to the right.\n* `bottom`: Aligns content to the bottom.\n* `bottomLeft`: Aligns content to the bottom/left.\n* `bottomRight`: Aligns content to the bottom/right.\n* `edge`: Justifies content to be evenly spread out up to the main axis edges of the container.\n* `stretch`: Stretches content to the cross axis edges of the container.",name:"alignment",required:!1,type:{name:'"center" | "inherit" | (string & {}) | "end" | "start" | "baseline" | "initial" | "left" | "right" | "top" | "bottom" | "-moz-initial" | "revert" | "revert-layer" | "unset" | "stretch" | ... 9 more ... | "self-start"'}},spacing:{defaultValue:{value:"2"},description:"The amount of space between each child element. Spacing in between each child can be adjusted by using `spacing`.\nThe value of `spacing` works as a multiplier to the library's grid system (base of `4px`).",name:"spacing",required:!1,type:{name:"Width<string | number>"}},as:{defaultValue:null,description:"The HTML element or React component to render the component as.",name:"as",required:!1,type:{name:'"symbol" | "object" | "select" | ComponentClass<any, any> | FunctionComponent<any> | "a" | "abbr" | "address" | "area" | "article" | "aside" | ... 524 more ... | ("view" & FunctionComponent<...>)'}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/h-stack/component.tsx#HStack"]={docgenInfo:HStack.__docgenInfo,name:"HStack",path:"packages/components/src/h-stack/component.tsx#HStack"})}catch(__react_docgen_typescript_loader_error){}},"./packages/components/src/h-stack/hook.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{R:()=>useHStack});var use_context_system=__webpack_require__("./packages/components/src/context/use-context-system.js"),context_connect=__webpack_require__("./packages/components/src/context/context-connect.ts"),component=__webpack_require__("./packages/components/src/flex/flex-item/component.tsx"),hook=__webpack_require__("./packages/components/src/flex/flex/hook.ts"),values=__webpack_require__("./packages/components/src/utils/values.js");const H_ALIGNMENTS={bottom:{align:"flex-end",justify:"center"},bottomLeft:{align:"flex-end",justify:"flex-start"},bottomRight:{align:"flex-end",justify:"flex-end"},center:{align:"center",justify:"center"},edge:{align:"center",justify:"space-between"},left:{align:"center",justify:"flex-start"},right:{align:"center",justify:"flex-end"},stretch:{align:"stretch"},top:{align:"flex-start",justify:"center"},topLeft:{align:"flex-start",justify:"flex-start"},topRight:{align:"flex-start",justify:"flex-end"}},V_ALIGNMENTS={bottom:{justify:"flex-end",align:"center"},bottomLeft:{justify:"flex-end",align:"flex-start"},bottomRight:{justify:"flex-end",align:"flex-end"},center:{justify:"center",align:"center"},edge:{justify:"space-between",align:"center"},left:{justify:"center",align:"flex-start"},right:{justify:"center",align:"flex-end"},stretch:{align:"stretch"},top:{justify:"flex-start",align:"center"},topLeft:{justify:"flex-start",align:"flex-start"},topRight:{justify:"flex-start",align:"flex-end"}};var get_valid_children=__webpack_require__("./packages/components/src/utils/get-valid-children.ts"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");function useHStack(props){const{alignment="edge",children,direction,spacing=2,...otherProps}=(0,use_context_system.y)(props,"HStack"),align=function getAlignmentProps(alignment,direction="row"){if(!(0,values.Jf)(alignment))return{};const props="column"===direction?V_ALIGNMENTS:H_ALIGNMENTS;return alignment in props?props[alignment]:{align:alignment}}(alignment,direction),propsForFlex={children:(0,get_valid_children.W)(children).map(((child,index)=>{if((0,context_connect.H)(child,["Spacer"])){const childElement=child,_key=childElement.key||`hstack-${index}`;return(0,jsx_runtime.jsx)(component.Z,{isBlock:!0,...childElement.props},_key)}return child})),direction,justify:"center",...align,...otherProps,gap:spacing},{isColumn,...flexProps}=(0,hook.k)(propsForFlex);return flexProps}try{useHStack.displayName="useHStack",useHStack.__docgenInfo={description:"",displayName:"useHStack",props:{children:{defaultValue:null,description:"The children elements.",name:"children",required:!0,type:{name:"ReactNode"}},direction:{defaultValue:{value:"'row'"},description:"The direction flow of the children content can be adjusted with\n`direction`. `column` will align children vertically and `row` will align\nchildren horizontally.",name:"direction",required:!1,type:{name:"FlexDirection"}},wrap:{defaultValue:{value:"false"},description:"Determines if children should wrap.",name:"wrap",required:!1,type:{name:"boolean"}},isReversed:{defaultValue:null,description:"@deprecated",name:"isReversed",required:!1,type:{name:"boolean"}},justify:{defaultValue:{value:"'space-between'"},description:"Horizontally aligns content if the `direction` is `row`, or vertically\naligns content if the `direction` is `column`.",name:"justify",required:!1,type:{name:"JustifyContent"}},expanded:{defaultValue:{value:"true"},description:"Expands to the maximum available width (if horizontal) or height (if\nvertical).",name:"expanded",required:!1,type:{name:"boolean"}},alignment:{defaultValue:{value:"'edge'"},description:"Determines how the child elements are aligned.\n\n* `top`: Aligns content to the top.\n* `topLeft`: Aligns content to the top/left.\n* `topRight`: Aligns content to the top/right.\n* `left`: Aligns content to the left.\n* `center`: Aligns content to the center.\n* `right`: Aligns content to the right.\n* `bottom`: Aligns content to the bottom.\n* `bottomLeft`: Aligns content to the bottom/left.\n* `bottomRight`: Aligns content to the bottom/right.\n* `edge`: Justifies content to be evenly spread out up to the main axis edges of the container.\n* `stretch`: Stretches content to the cross axis edges of the container.",name:"alignment",required:!1,type:{name:'"center" | "inherit" | (string & {}) | "end" | "start" | "baseline" | "initial" | "left" | "right" | "top" | "bottom" | "-moz-initial" | "revert" | "revert-layer" | "unset" | "stretch" | ... 9 more ... | "self-start"'}},spacing:{defaultValue:{value:"2"},description:"The amount of space between each child element. Spacing in between each child can be adjusted by using `spacing`.\nThe value of `spacing` works as a multiplier to the library's grid system (base of `4px`).",name:"spacing",required:!1,type:{name:"Width<string | number>"}},as:{defaultValue:null,description:"The HTML element or React component to render the component as.",name:"as",required:!1,type:{name:"enum",value:[{value:'"symbol"'},{value:'"object"'},{value:'"select"'},{value:'"a"'},{value:'"abbr"'},{value:'"address"'},{value:'"area"'},{value:'"article"'},{value:'"aside"'},{value:'"audio"'},{value:'"b"'},{value:'"base"'},{value:'"bdi"'},{value:'"bdo"'},{value:'"big"'},{value:'"blockquote"'},{value:'"body"'},{value:'"br"'},{value:'"button"'},{value:'"canvas"'},{value:'"caption"'},{value:'"center"'},{value:'"cite"'},{value:'"code"'},{value:'"col"'},{value:'"colgroup"'},{value:'"data"'},{value:'"datalist"'},{value:'"dd"'},{value:'"del"'},{value:'"details"'},{value:'"dfn"'},{value:'"dialog"'},{value:'"div"'},{value:'"dl"'},{value:'"dt"'},{value:'"em"'},{value:'"embed"'},{value:'"fieldset"'},{value:'"figcaption"'},{value:'"figure"'},{value:'"footer"'},{value:'"form"'},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'},{value:'"head"'},{value:'"header"'},{value:'"hgroup"'},{value:'"hr"'},{value:'"html"'},{value:'"i"'},{value:'"iframe"'},{value:'"img"'},{value:'"input"'},{value:'"ins"'},{value:'"kbd"'},{value:'"keygen"'},{value:'"label"'},{value:'"legend"'},{value:'"li"'},{value:'"link"'},{value:'"main"'},{value:'"map"'},{value:'"mark"'},{value:'"menu"'},{value:'"menuitem"'},{value:'"meta"'},{value:'"meter"'},{value:'"nav"'},{value:'"noindex"'},{value:'"noscript"'},{value:'"ol"'},{value:'"optgroup"'},{value:'"option"'},{value:'"output"'},{value:'"p"'},{value:'"param"'},{value:'"picture"'},{value:'"pre"'},{value:'"progress"'},{value:'"q"'},{value:'"rp"'},{value:'"rt"'},{value:'"ruby"'},{value:'"s"'},{value:'"samp"'},{value:'"search"'},{value:'"slot"'},{value:'"script"'},{value:'"section"'},{value:'"small"'},{value:'"source"'},{value:'"span"'},{value:'"strong"'},{value:'"style"'},{value:'"sub"'},{value:'"summary"'},{value:'"sup"'},{value:'"table"'},{value:'"template"'},{value:'"tbody"'},{value:'"td"'},{value:'"textarea"'},{value:'"tfoot"'},{value:'"th"'},{value:'"thead"'},{value:'"time"'},{value:'"title"'},{value:'"tr"'},{value:'"track"'},{value:'"u"'},{value:'"ul"'},{value:'"var"'},{value:'"video"'},{value:'"wbr"'},{value:'"webview"'},{value:'"svg"'},{value:'"animate"'},{value:'"animateMotion"'},{value:'"animateTransform"'},{value:'"circle"'},{value:'"clipPath"'},{value:'"defs"'},{value:'"desc"'},{value:'"ellipse"'},{value:'"feBlend"'},{value:'"feColorMatrix"'},{value:'"feComponentTransfer"'},{value:'"feComposite"'},{value:'"feConvolveMatrix"'},{value:'"feDiffuseLighting"'},{value:'"feDisplacementMap"'},{value:'"feDistantLight"'},{value:'"feDropShadow"'},{value:'"feFlood"'},{value:'"feFuncA"'},{value:'"feFuncB"'},{value:'"feFuncG"'},{value:'"feFuncR"'},{value:'"feGaussianBlur"'},{value:'"feImage"'},{value:'"feMerge"'},{value:'"feMergeNode"'},{value:'"feMorphology"'},{value:'"feOffset"'},{value:'"fePointLight"'},{value:'"feSpecularLighting"'},{value:'"feSpotLight"'},{value:'"feTile"'},{value:'"feTurbulence"'},{value:'"filter"'},{value:'"foreignObject"'},{value:'"g"'},{value:'"image"'},{value:'"line"'},{value:'"linearGradient"'},{value:'"marker"'},{value:'"mask"'},{value:'"metadata"'},{value:'"mpath"'},{value:'"path"'},{value:'"pattern"'},{value:'"polygon"'},{value:'"polyline"'},{value:'"radialGradient"'},{value:'"rect"'},{value:'"set"'},{value:'"stop"'},{value:'"switch"'},{value:'"text"'},{value:'"textPath"'},{value:'"tspan"'},{value:'"use"'},{value:'"view"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/h-stack/hook.tsx#useHStack"]={docgenInfo:useHStack.__docgenInfo,name:"useHStack",path:"packages/components/src/h-stack/hook.tsx#useHStack"})}catch(__react_docgen_typescript_loader_error){}},"./packages/components/src/number-control/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>number_control});var clsx=__webpack_require__("./node_modules/clsx/dist/clsx.mjs"),react=__webpack_require__("./node_modules/react/index.js"),build_module=__webpack_require__("./packages/i18n/build-module/index.js"),plus=__webpack_require__("./packages/icons/build-module/library/plus.js"),library_reset=__webpack_require__("./packages/icons/build-module/library/reset.js"),use_merge_refs=__webpack_require__("./packages/compose/build-module/hooks/use-merge-refs/index.js"),deprecated_build_module=__webpack_require__("./packages/deprecated/build-module/index.js"),emotion_styled_base_browser_esm=__webpack_require__("./node_modules/@emotion/styled/base/dist/emotion-styled-base.browser.esm.js"),emotion_react_browser_esm=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),input_control=__webpack_require__("./packages/components/src/input-control/index.tsx"),colors_values=__webpack_require__("./packages/components/src/utils/colors-values.js"),src_button=__webpack_require__("./packages/components/src/button/index.tsx"),space=__webpack_require__("./packages/components/src/utils/space.ts");var _ref={name:"euqsgg",styles:"input[type='number']::-webkit-outer-spin-button,input[type='number']::-webkit-inner-spin-button{-webkit-appearance:none!important;margin:0!important;}input[type='number']{-moz-appearance:textfield;}"};const htmlArrowStyles=({hideHTMLArrows})=>hideHTMLArrows?_ref:"",Input=(0,emotion_styled_base_browser_esm.Z)(input_control.ZP,{target:"ep09it41"})(htmlArrowStyles,";"),SpinButton=(0,emotion_styled_base_browser_esm.Z)(src_button.ZP,{target:"ep09it40"})("&&&&&{color:",colors_values.D.theme.accent,";}"),styles={smallSpinButtons:(0,emotion_react_browser_esm.iv)("width:",(0,space.D)(5),";min-width:",(0,space.D)(5),";height:",(0,space.D)(5),";","")};var actions=__webpack_require__("./packages/components/src/input-control/reducer/actions.ts"),math=__webpack_require__("./packages/components/src/utils/math.js"),values=__webpack_require__("./packages/components/src/utils/values.js"),component=__webpack_require__("./packages/components/src/h-stack/component.tsx"),spacer_component=__webpack_require__("./packages/components/src/spacer/component.tsx"),use_cx=__webpack_require__("./packages/components/src/utils/hooks/use-cx.ts"),use_deprecated_props=__webpack_require__("./packages/components/src/utils/use-deprecated-props.ts"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const noop=()=>{};function UnforwardedNumberControl(props,forwardedRef){const{__unstableStateReducer:stateReducerProp,className,dragDirection="n",hideHTMLArrows=!1,spinControls=hideHTMLArrows?"none":"native",isDragEnabled=!0,isShiftStepEnabled=!0,label,max=1/0,min=-1/0,required=!1,shiftStep=10,step=1,spinFactor=1,type:typeProp="number",value:valueProp,size="default",suffix,onChange=noop,...restProps}=(0,use_deprecated_props.s)(props);hideHTMLArrows&&(0,deprecated_build_module.Z)("wp.components.NumberControl hideHTMLArrows prop ",{alternative:'spinControls="none"',since:"6.2",version:"6.3"});const inputRef=(0,react.useRef)(),mergedRef=(0,use_merge_refs.Z)([inputRef,forwardedRef]),isStepAny="any"===step,baseStep=isStepAny?1:(0,values.q9)(step),baseSpin=(0,values.q9)(spinFactor)*baseStep,baseValue=(0,math.Pc)(0,min,max,baseStep),constrainValue=(value,stepOverride)=>isStepAny?""+Math.min(max,Math.max(min,(0,values.q9)(value))):""+(0,math.Pc)(value,min,max,null!=stepOverride?stepOverride:baseStep),autoComplete="number"===typeProp?"off":void 0,classes=(0,clsx.Z)("components-number-control",className),spinButtonClasses=(0,use_cx.I)()("small"===size&&styles.smallSpinButtons),spinValue=(value,direction,event)=>{event?.preventDefault();const shift=event?.shiftKey&&isShiftStepEnabled,delta=shift?(0,values.q9)(shiftStep)*baseSpin:baseSpin;let nextValue=(0,values.Wx)(value)?baseValue:value;return"up"===direction?nextValue=(0,math.IH)(nextValue,delta):"down"===direction&&(nextValue=(0,math.$X)(nextValue,delta)),constrainValue(nextValue,shift?delta:void 0)},buildSpinButtonClickHandler=direction=>event=>onChange(String(spinValue(valueProp,direction,event)),{event:{...event,target:inputRef.current}});return(0,jsx_runtime.jsx)(Input,{autoComplete,inputMode:"numeric",...restProps,className:classes,dragDirection,hideHTMLArrows:"native"!==spinControls,isDragEnabled,label,max,min,ref:mergedRef,required,step,type:typeProp,value:valueProp,__unstableStateReducer:(state,action)=>{var _stateReducerProp;const baseState=((state,action)=>{const nextState={...state},{type,payload}=action,event=payload.event,currentValue=nextState.value;if(type!==actions.Oh&&type!==actions.LX||(nextState.value=spinValue(currentValue,type===actions.Oh?"up":"down",event)),type===actions.Wp&&isDragEnabled){const[x,y]=payload.delta,enableShift=payload.shiftKey&&isShiftStepEnabled,modifier=enableShift?(0,values.q9)(shiftStep)*baseSpin:baseSpin;let directionModifier,delta;switch(dragDirection){case"n":delta=y,directionModifier=-1;break;case"e":delta=x,directionModifier=(0,build_module.dZ)()?-1:1;break;case"s":delta=y,directionModifier=1;break;case"w":delta=x,directionModifier=(0,build_module.dZ)()?1:-1}if(0!==delta){delta=Math.ceil(Math.abs(delta))*Math.sign(delta);const distance=delta*modifier*directionModifier;nextState.value=constrainValue((0,math.IH)(currentValue,distance),enableShift?modifier:void 0)}}if(type===actions.Q4||type===actions.g){const applyEmptyValue=!1===required&&""===currentValue;nextState.value=applyEmptyValue?currentValue:constrainValue(currentValue)}return nextState})(state,action);return null!==(_stateReducerProp=stateReducerProp?.(baseState,action))&&void 0!==_stateReducerProp?_stateReducerProp:baseState},size,suffix:"custom"===spinControls?(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[suffix,(0,jsx_runtime.jsx)(spacer_component.Z,{marginBottom:0,marginRight:2,children:(0,jsx_runtime.jsxs)(component.Z,{spacing:1,children:[(0,jsx_runtime.jsx)(SpinButton,{className:spinButtonClasses,icon:plus.Z,size:"small",label:(0,build_module.__)("Increment"),onClick:buildSpinButtonClickHandler("up")}),(0,jsx_runtime.jsx)(SpinButton,{className:spinButtonClasses,icon:library_reset.Z,size:"small",label:(0,build_module.__)("Decrement"),onClick:buildSpinButtonClickHandler("down")})]})})]}):suffix,onChange})}UnforwardedNumberControl.displayName="UnforwardedNumberControl";const NumberControl=(0,react.forwardRef)(UnforwardedNumberControl),number_control=NumberControl;try{NumberControl.displayName="NumberControl",NumberControl.__docgenInfo={description:"",displayName:"NumberControl",props:{label:{defaultValue:null,description:"If this property is added, a label will be generated using label property as the content.",name:"label",required:!1,type:{name:"ReactNode"}},prefix:{defaultValue:null,description:"Renders an element on the left side of the input.\n\nBy default, the prefix is aligned with the edge of the input border, with no padding.\nIf you want to apply standard padding in accordance with the size variant, wrap the element in\nthe provided `<InputControlPrefixWrapper>` component.\n@example import {\n  __experimentalInputControl as InputControl,\n  __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,\n} from '@wordpress/components';\n\n<InputControl\n  prefix={<InputControlPrefixWrapper>@</InputControlPrefixWrapper>}\n/>",name:"prefix",required:!1,type:{name:"ReactNode"}},onChange:{defaultValue:null,description:"A function that receives the value of the input.",name:"onChange",required:!1,type:{name:"InputChangeCallback<{}>"}},onDrag:{defaultValue:null,description:"",name:"onDrag",required:!1,type:{name:'(dragProps: Omit<FullGestureState<"drag">, "event"> & { event: unknown; }) => void'}},onDragEnd:{defaultValue:null,description:"",name:"onDragEnd",required:!1,type:{name:'(dragProps: Omit<FullGestureState<"drag">, "event"> & { event: unknown; }) => void'}},onDragStart:{defaultValue:null,description:"",name:"onDragStart",required:!1,type:{name:'(dragProps: Omit<FullGestureState<"drag">, "event"> & { event: unknown; }) => void'}},disabled:{defaultValue:{value:"false"},description:"If true, the `input` will be disabled.",name:"disabled",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"'default'"},description:"Adjusts the size of the input.",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"default"'},{value:'"compact"'},{value:'"__unstable-large"'}]}},suffix:{defaultValue:null,description:"Renders an element on the right side of the input.\n\nBy default, the suffix is aligned with the edge of the input border, with no padding.\nIf you want to apply standard padding in accordance with the size variant, wrap the element in\nthe provided `<InputControlSuffixWrapper>` component.\n@example import {\n  __experimentalInputControl as InputControl,\n  __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,\n} from '@wordpress/components';\n\n<InputControl\n  suffix={<InputControlSuffixWrapper>%</InputControlSuffixWrapper>}\n/>",name:"suffix",required:!1,type:{name:"ReactNode"}},__next36pxDefaultSize:{defaultValue:{value:"false"},description:"Deprecated. Use `__next40pxDefaultSize` instead.\n@deprecated\n@ignore",name:"__next36pxDefaultSize",required:!1,type:{name:"boolean"}},__next40pxDefaultSize:{defaultValue:{value:"false"},description:"Start opting into the larger default height that will become the default size in a future version.",name:"__next40pxDefaultSize",required:!1,type:{name:"boolean"}},__unstableInputWidth:{defaultValue:null,description:"",name:"__unstableInputWidth",required:!1,type:{name:"Width<string | number>"}},hideLabelFromVision:{defaultValue:{value:"false"},description:"If true, the label will only be visible to screen readers.",name:"hideLabelFromVision",required:!1,type:{name:"boolean"}},labelPosition:{defaultValue:{value:"'top'"},description:"The position of the label.",name:"labelPosition",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'},{value:'"edge"'},{value:'"side"'}]}},help:{defaultValue:null,description:"Additional description for the control.\n\nOnly use for meaningful description or instructions for the control. An element containing the description will be programmatically associated to the BaseControl by the means of an `aria-describedby` attribute.",name:"help",required:!1,type:{name:"ReactNode"}},dragDirection:{defaultValue:{value:"'n'"},description:"Determines the drag axis.",name:"dragDirection",required:!1,type:{name:"enum",value:[{value:'"s"'},{value:'"n"'},{value:'"e"'},{value:'"w"'}]}},dragThreshold:{defaultValue:{value:"10"},description:"If `isDragEnabled` is true, this controls the amount of `px` to have been dragged before\nthe drag gesture is actually triggered.",name:"dragThreshold",required:!1,type:{name:"number"}},isPressEnterToChange:{defaultValue:{value:"false"},description:"If true, the `ENTER` key press is required in order to trigger an `onChange`.\nIf enabled, a change is also triggered when tabbing away (`onBlur`).",name:"isPressEnterToChange",required:!1,type:{name:"boolean"}},onValidate:{defaultValue:null,description:"",name:"onValidate",required:!1,type:{name:"(nextValue: string, event?: SyntheticEvent<HTMLInputElement, Event>) => void"}},__unstableStateReducer:{defaultValue:null,description:"",name:"__unstableStateReducer",required:!1,type:{name:"StateReducer"}},hideHTMLArrows:{defaultValue:{value:"false"},description:"If true, the default `input` HTML arrows will be hidden.\n@deprecated",name:"hideHTMLArrows",required:!1,type:{name:"boolean"}},spinControls:{defaultValue:{value:"'native'"},description:"The type of spin controls to display. These are buttons that allow the\nuser to quickly increment and decrement the number.\n\n- 'none' - Do not show spin controls.\n- 'native' - Use browser's native HTML `input` controls.\n- 'custom' - Use plus and minus icon buttons.",name:"spinControls",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"custom"'},{value:'"native"'}]}},isDragEnabled:{defaultValue:{value:"true"},description:"If true, enables mouse drag gestures.",name:"isDragEnabled",required:!1,type:{name:"boolean"}},isShiftStepEnabled:{defaultValue:{value:"true"},description:"If true, pressing `UP` or `DOWN` along with the `SHIFT` key will increment the\nvalue by the `shiftStep` value.",name:"isShiftStepEnabled",required:!1,type:{name:"boolean"}},max:{defaultValue:{value:"Infinity"},description:"The maximum `value` allowed.",name:"max",required:!1,type:{name:"number"}},min:{defaultValue:{value:"-Infinity"},description:"The minimum `value` allowed.",name:"min",required:!1,type:{name:"number"}},required:{defaultValue:{value:"false"},description:"If `true` enforces a valid number within the control's min/max range.\nIf `false` allows an empty string as a valid value.",name:"required",required:!1,type:{name:"boolean"}},shiftStep:{defaultValue:{value:"10"},description:"Amount to increment by when the `SHIFT` key is held down. This shift value is\na multiplier to the `step` value. For example, if the `step` value is `5`,\nand `shiftStep` is `10`, each jump would increment/decrement by `50`.",name:"shiftStep",required:!1,type:{name:"number"}},step:{defaultValue:{value:"1"},description:"Amount by which the `value` is changed when incrementing/decrementing.\nIt is also a factor in validation as `value` must be a multiple of `step`\n(offset by `min`, if specified) to be valid. Accepts the special string value `any`\nthat voids the validation constraint and causes stepping actions to increment/decrement by `1`.",name:"step",required:!1,type:{name:"string | number"}},spinFactor:{defaultValue:{value:"1"},description:'Optional multiplication factor in spin changes. i.e. A spin changes\nby `spinFactor * step` (if `step` is "any", 1 is used instead).',name:"spinFactor",required:!1,type:{name:"number"}},type:{defaultValue:{value:"'number'"},description:"The `type` attribute of the `input` element.",name:"type",required:!1,type:{name:"HTMLInputTypeAttribute"}},value:{defaultValue:null,description:"The value of the input.",name:"value",required:!1,type:{name:"string | number"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/number-control/index.tsx#NumberControl"]={docgenInfo:NumberControl.__docgenInfo,name:"NumberControl",path:"packages/components/src/number-control/index.tsx#NumberControl"})}catch(__react_docgen_typescript_loader_error){}try{numbercontrol.displayName="numbercontrol",numbercontrol.__docgenInfo={description:"",displayName:"numbercontrol",props:{label:{defaultValue:null,description:"If this property is added, a label will be generated using label property as the content.",name:"label",required:!1,type:{name:"ReactNode"}},prefix:{defaultValue:null,description:"Renders an element on the left side of the input.\n\nBy default, the prefix is aligned with the edge of the input border, with no padding.\nIf you want to apply standard padding in accordance with the size variant, wrap the element in\nthe provided `<InputControlPrefixWrapper>` component.\n@example import {\n  __experimentalInputControl as InputControl,\n  __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,\n} from '@wordpress/components';\n\n<InputControl\n  prefix={<InputControlPrefixWrapper>@</InputControlPrefixWrapper>}\n/>",name:"prefix",required:!1,type:{name:"ReactNode"}},onChange:{defaultValue:null,description:"A function that receives the value of the input.",name:"onChange",required:!1,type:{name:"InputChangeCallback<{}>"}},onDrag:{defaultValue:null,description:"",name:"onDrag",required:!1,type:{name:'(dragProps: Omit<FullGestureState<"drag">, "event"> & { event: unknown; }) => void'}},onDragEnd:{defaultValue:null,description:"",name:"onDragEnd",required:!1,type:{name:'(dragProps: Omit<FullGestureState<"drag">, "event"> & { event: unknown; }) => void'}},onDragStart:{defaultValue:null,description:"",name:"onDragStart",required:!1,type:{name:'(dragProps: Omit<FullGestureState<"drag">, "event"> & { event: unknown; }) => void'}},disabled:{defaultValue:{value:"false"},description:"If true, the `input` will be disabled.",name:"disabled",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"'default'"},description:"Adjusts the size of the input.",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"default"'},{value:'"compact"'},{value:'"__unstable-large"'}]}},suffix:{defaultValue:null,description:"Renders an element on the right side of the input.\n\nBy default, the suffix is aligned with the edge of the input border, with no padding.\nIf you want to apply standard padding in accordance with the size variant, wrap the element in\nthe provided `<InputControlSuffixWrapper>` component.\n@example import {\n  __experimentalInputControl as InputControl,\n  __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,\n} from '@wordpress/components';\n\n<InputControl\n  suffix={<InputControlSuffixWrapper>%</InputControlSuffixWrapper>}\n/>",name:"suffix",required:!1,type:{name:"ReactNode"}},__next36pxDefaultSize:{defaultValue:{value:"false"},description:"Deprecated. Use `__next40pxDefaultSize` instead.\n@deprecated\n@ignore",name:"__next36pxDefaultSize",required:!1,type:{name:"boolean"}},__next40pxDefaultSize:{defaultValue:{value:"false"},description:"Start opting into the larger default height that will become the default size in a future version.",name:"__next40pxDefaultSize",required:!1,type:{name:"boolean"}},__unstableInputWidth:{defaultValue:null,description:"",name:"__unstableInputWidth",required:!1,type:{name:"Width<string | number>"}},hideLabelFromVision:{defaultValue:{value:"false"},description:"If true, the label will only be visible to screen readers.",name:"hideLabelFromVision",required:!1,type:{name:"boolean"}},labelPosition:{defaultValue:{value:"'top'"},description:"The position of the label.",name:"labelPosition",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'},{value:'"edge"'},{value:'"side"'}]}},help:{defaultValue:null,description:"Additional description for the control.\n\nOnly use for meaningful description or instructions for the control. An element containing the description will be programmatically associated to the BaseControl by the means of an `aria-describedby` attribute.",name:"help",required:!1,type:{name:"ReactNode"}},dragDirection:{defaultValue:{value:"'n'"},description:"Determines the drag axis.",name:"dragDirection",required:!1,type:{name:"enum",value:[{value:'"s"'},{value:'"n"'},{value:'"e"'},{value:'"w"'}]}},dragThreshold:{defaultValue:{value:"10"},description:"If `isDragEnabled` is true, this controls the amount of `px` to have been dragged before\nthe drag gesture is actually triggered.",name:"dragThreshold",required:!1,type:{name:"number"}},isPressEnterToChange:{defaultValue:{value:"false"},description:"If true, the `ENTER` key press is required in order to trigger an `onChange`.\nIf enabled, a change is also triggered when tabbing away (`onBlur`).",name:"isPressEnterToChange",required:!1,type:{name:"boolean"}},onValidate:{defaultValue:null,description:"",name:"onValidate",required:!1,type:{name:"(nextValue: string, event?: SyntheticEvent<HTMLInputElement, Event>) => void"}},__unstableStateReducer:{defaultValue:null,description:"",name:"__unstableStateReducer",required:!1,type:{name:"StateReducer"}},hideHTMLArrows:{defaultValue:{value:"false"},description:"If true, the default `input` HTML arrows will be hidden.\n@deprecated",name:"hideHTMLArrows",required:!1,type:{name:"boolean"}},spinControls:{defaultValue:{value:"'native'"},description:"The type of spin controls to display. These are buttons that allow the\nuser to quickly increment and decrement the number.\n\n- 'none' - Do not show spin controls.\n- 'native' - Use browser's native HTML `input` controls.\n- 'custom' - Use plus and minus icon buttons.",name:"spinControls",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"custom"'},{value:'"native"'}]}},isDragEnabled:{defaultValue:{value:"true"},description:"If true, enables mouse drag gestures.",name:"isDragEnabled",required:!1,type:{name:"boolean"}},isShiftStepEnabled:{defaultValue:{value:"true"},description:"If true, pressing `UP` or `DOWN` along with the `SHIFT` key will increment the\nvalue by the `shiftStep` value.",name:"isShiftStepEnabled",required:!1,type:{name:"boolean"}},max:{defaultValue:{value:"Infinity"},description:"The maximum `value` allowed.",name:"max",required:!1,type:{name:"number"}},min:{defaultValue:{value:"-Infinity"},description:"The minimum `value` allowed.",name:"min",required:!1,type:{name:"number"}},required:{defaultValue:{value:"false"},description:"If `true` enforces a valid number within the control's min/max range.\nIf `false` allows an empty string as a valid value.",name:"required",required:!1,type:{name:"boolean"}},shiftStep:{defaultValue:{value:"10"},description:"Amount to increment by when the `SHIFT` key is held down. This shift value is\na multiplier to the `step` value. For example, if the `step` value is `5`,\nand `shiftStep` is `10`, each jump would increment/decrement by `50`.",name:"shiftStep",required:!1,type:{name:"number"}},step:{defaultValue:{value:"1"},description:"Amount by which the `value` is changed when incrementing/decrementing.\nIt is also a factor in validation as `value` must be a multiple of `step`\n(offset by `min`, if specified) to be valid. Accepts the special string value `any`\nthat voids the validation constraint and causes stepping actions to increment/decrement by `1`.",name:"step",required:!1,type:{name:"string | number"}},spinFactor:{defaultValue:{value:"1"},description:'Optional multiplication factor in spin changes. i.e. A spin changes\nby `spinFactor * step` (if `step` is "any", 1 is used instead).',name:"spinFactor",required:!1,type:{name:"number"}},type:{defaultValue:{value:"'number'"},description:"The `type` attribute of the `input` element.",name:"type",required:!1,type:{name:"HTMLInputTypeAttribute"}},value:{defaultValue:null,description:"The value of the input.",name:"value",required:!1,type:{name:"string | number"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/number-control/index.tsx#numbercontrol"]={docgenInfo:numbercontrol.__docgenInfo,name:"numbercontrol",path:"packages/components/src/number-control/index.tsx#numbercontrol"})}catch(__react_docgen_typescript_loader_error){}},"./packages/components/src/utils/get-valid-children.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{W:()=>getValidChildren});var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");function getValidChildren(children){return"string"==typeof children?[children]:_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Children.toArray(children).filter((child=>(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(child)))}}}]);