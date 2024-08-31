"use strict";(globalThis.webpackChunkgutenberg=globalThis.webpackChunkgutenberg||[]).push([[8631],{"./packages/compose/build-module/hooks/use-previous/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>usePrevious});var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");function usePrevious(value){const ref=(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)();return(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{ref.current=value}),[value]),ref.current}},"./packages/components/src/toggle-group-control/context.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{L:()=>useToggleGroupControlContext,Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const ToggleGroupControlContext=(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createContext)({}),useToggleGroupControlContext=()=>(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useContext)(ToggleGroupControlContext),__WEBPACK_DEFAULT_EXPORT__=ToggleGroupControlContext},"./packages/components/src/toggle-group-control/toggle-group-control-option-base/component.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>component});var styles_namespaceObject={};__webpack_require__.r(styles_namespaceObject),__webpack_require__.d(styles_namespaceObject,{ButtonContentView:()=>ButtonContentView,LabelView:()=>LabelView,Uz:()=>backdropView,Ji:()=>buttonView,IA:()=>labelBlock});var K7FXVWIT=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/__chunks/K7FXVWIT.js"),motion=__webpack_require__("./node_modules/framer-motion/dist/es/render/dom/motion.mjs"),use_reduced_motion=__webpack_require__("./packages/compose/build-module/hooks/use-reduced-motion/index.js"),use_instance_id=__webpack_require__("./packages/compose/build-module/hooks/use-instance-id/index.js"),react=__webpack_require__("./node_modules/react/index.js"),use_context_system=__webpack_require__("./packages/components/src/context/use-context-system.js"),context_connect=__webpack_require__("./packages/components/src/context/context-connect.ts"),context=__webpack_require__("./packages/components/src/toggle-group-control/context.ts"),emotion_styled_base_browser_esm=__webpack_require__("./node_modules/@emotion/styled/base/dist/emotion-styled-base.browser.esm.js"),emotion_react_browser_esm=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),config_values=__webpack_require__("./packages/components/src/utils/config-values.js"),colors_values=__webpack_require__("./packages/components/src/utils/colors-values.js");const LabelView=(0,emotion_styled_base_browser_esm.Z)("div",{target:"et6ln9s1"})({name:"sln1fl",styles:"display:inline-flex;max-width:100%;min-width:0;position:relative"}),labelBlock={name:"82a6rk",styles:"flex:1"},buttonView=({isDeselectable,isIcon,isPressed,size})=>(0,emotion_react_browser_esm.iv)("align-items:center;appearance:none;background:transparent;border:none;border-radius:",config_values.Z.radiusXSmall,";color:",colors_values.D.gray[700],";fill:currentColor;cursor:pointer;display:flex;font-family:inherit;height:100%;justify-content:center;line-height:100%;outline:none;padding:0 12px;position:relative;text-align:center;@media not ( prefers-reduced-motion ){transition:background ",config_values.Z.transitionDurationFast," linear,color ",config_values.Z.transitionDurationFast," linear,font-weight 60ms linear;}user-select:none;width:100%;z-index:2;&::-moz-focus-inner{border:0;}&[disabled]{opacity:0.4;cursor:default;}&:active{background:",config_values.Z.toggleGroupControlBackgroundColor,";}",isDeselectable&&deselectable," ",isIcon&&isIconStyles({size})," ",isPressed&&pressed,";",""),pressed=(0,emotion_react_browser_esm.iv)("color:",colors_values.D.white,";&:active{background:transparent;}",""),deselectable=(0,emotion_react_browser_esm.iv)("color:",colors_values.D.gray[900],";&:focus{box-shadow:inset 0 0 0 1px ",colors_values.D.white,",0 0 0 ",config_values.Z.borderWidthFocus," ",colors_values.D.theme.accent,";outline:2px solid transparent;}",""),ButtonContentView=(0,emotion_styled_base_browser_esm.Z)("div",{target:"et6ln9s0"})("display:flex;font-size:",config_values.Z.fontSize,";line-height:1;"),isIconStyles=({size="default"})=>(0,emotion_react_browser_esm.iv)("color:",colors_values.D.gray[900],";height:",{default:"30px","__unstable-large":"32px"}[size],";aspect-ratio:1;padding-left:0;padding-right:0;",""),backdropView=(0,emotion_react_browser_esm.iv)("background:",colors_values.D.gray[900],";border-radius:",config_values.Z.radiusXSmall,";position:absolute;inset:0;z-index:1;outline:2px solid transparent;outline-offset:-3px;","");var use_cx=__webpack_require__("./packages/components/src/utils/hooks/use-cx.ts"),tooltip=__webpack_require__("./packages/components/src/tooltip/index.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const{ButtonContentView:component_ButtonContentView,LabelView:component_LabelView}=styles_namespaceObject,REDUCED_MOTION_TRANSITION_CONFIG={duration:0},WithToolTip=({showTooltip,text,children})=>showTooltip&&text?(0,jsx_runtime.jsx)(tooltip.ZP,{text,placement:"top",children}):(0,jsx_runtime.jsx)(jsx_runtime.Fragment,{children});function ToggleGroupControlOptionBase(props,forwardedRef){const shouldReduceMotion=(0,use_reduced_motion.Z)(),toggleGroupControlContext=(0,context.L)(),id=(0,use_instance_id.Z)(ToggleGroupControlOptionBase,toggleGroupControlContext.baseId||"toggle-group-control-option-base"),buttonProps=(0,use_context_system.y)({...props,id},"ToggleGroupControlOptionBase"),{isBlock=!1,isDeselectable=!1,size="default"}=toggleGroupControlContext,{className,isIcon=!1,value,children,showTooltip=!1,onFocus:onFocusProp,disabled,...otherButtonProps}=buttonProps,isPressed=toggleGroupControlContext.value===value,cx=(0,use_cx.I)(),labelViewClasses=(0,react.useMemo)((()=>cx(isBlock&&labelBlock)),[cx,isBlock]),itemClasses=(0,react.useMemo)((()=>cx(buttonView({isDeselectable,isIcon,isPressed,size}),className)),[cx,isDeselectable,isIcon,isPressed,size,className]),backdropClasses=(0,react.useMemo)((()=>cx(backdropView)),[cx]),commonProps={...otherButtonProps,className:itemClasses,"data-value":value,ref:forwardedRef};return(0,jsx_runtime.jsxs)(component_LabelView,{className:labelViewClasses,children:[(0,jsx_runtime.jsx)(WithToolTip,{showTooltip,text:otherButtonProps["aria-label"],children:isDeselectable?(0,jsx_runtime.jsx)("button",{...commonProps,disabled,onFocus:onFocusProp,"aria-pressed":isPressed,type:"button",onClick:()=>{isDeselectable&&isPressed?toggleGroupControlContext.setValue(void 0):toggleGroupControlContext.setValue(value)},children:(0,jsx_runtime.jsx)(component_ButtonContentView,{children})}):(0,jsx_runtime.jsx)(K7FXVWIT.Y,{disabled,render:(0,jsx_runtime.jsx)("button",{type:"button",...commonProps,onFocus:event=>{onFocusProp?.(event),event.defaultPrevented||toggleGroupControlContext.setValue(value)}}),value,children:(0,jsx_runtime.jsx)(component_ButtonContentView,{children})})}),isPressed?(0,jsx_runtime.jsx)(motion.E.div,{layout:!0,layoutRoot:!0,children:(0,jsx_runtime.jsx)(motion.E.div,{className:backdropClasses,transition:shouldReduceMotion?REDUCED_MOTION_TRANSITION_CONFIG:void 0,role:"presentation",layoutId:"toggle-group-backdrop-shared-layout-id"})}):null]})}ToggleGroupControlOptionBase.displayName="ToggleGroupControlOptionBase";const component=(0,context_connect.Iq)(ToggleGroupControlOptionBase,"ToggleGroupControlOptionBase")},"./packages/components/src/toggle-group-control/toggle-group-control/component.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>toggle_group_control_component});var LayoutGroup=__webpack_require__("./node_modules/framer-motion/dist/es/components/LayoutGroup/index.mjs"),use_instance_id=__webpack_require__("./packages/compose/build-module/hooks/use-instance-id/index.js"),react=__webpack_require__("./node_modules/react/index.js"),use_context_system=__webpack_require__("./packages/components/src/context/use-context-system.js"),context_connect=__webpack_require__("./packages/components/src/context/context-connect.ts"),use_cx=__webpack_require__("./packages/components/src/utils/hooks/use-cx.ts"),base_control=__webpack_require__("./packages/components/src/base-control/index.tsx"),emotion_styled_base_browser_esm=__webpack_require__("./node_modules/@emotion/styled/base/dist/emotion-styled-base.browser.esm.js"),emotion_react_browser_esm=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),colors_values=__webpack_require__("./packages/components/src/utils/colors-values.js"),config_values=__webpack_require__("./packages/components/src/utils/config-values.js");const enclosingBorders=isBlock=>{const enclosingBorder=(0,emotion_react_browser_esm.iv)("border-color:",colors_values.D.ui.border,";","");return(0,emotion_react_browser_esm.iv)(isBlock&&enclosingBorder," &:hover{border-color:",colors_values.D.ui.borderHover,";}&:focus-within{border-color:",colors_values.D.ui.borderFocus,";box-shadow:",config_values.Z.controlBoxShadowFocus,";z-index:1;outline:2px solid transparent;outline-offset:-2px;}","")};var _ref={name:"1aqh2c7",styles:"min-height:40px;padding:3px"},_ref2={name:"1ndywgm",styles:"min-height:36px;padding:2px"};const toggleGroupControlSize=size=>({default:_ref2,"__unstable-large":_ref}[size]),block={name:"7whenc",styles:"display:flex;width:100%"},VisualLabelWrapper=(0,emotion_styled_base_browser_esm.Z)("div",{target:"eakva830"})({name:"zjik7",styles:"display:flex"});var DYHFBFEH=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/__chunks/DYHFBFEH.js"),radio_group=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/radio/radio-group.js"),_2GXGCHW6=__webpack_require__("./packages/components/node_modules/@ariakit/react-core/esm/__chunks/2GXGCHW6.js"),component=__webpack_require__("./packages/components/src/view/component.tsx"),context=__webpack_require__("./packages/components/src/toggle-group-control/context.ts"),use_previous=__webpack_require__("./packages/compose/build-module/hooks/use-previous/index.js");function useComputeControlledOrUncontrolledValue(valueProp){const isInitialRenderRef=(0,react.useRef)(!0),prevValueProp=(0,use_previous.Z)(valueProp),prevIsControlledRef=(0,react.useRef)(!1);(0,react.useEffect)((()=>{isInitialRenderRef.current&&(isInitialRenderRef.current=!1)}),[]);const isControlled=prevIsControlledRef.current||!isInitialRenderRef.current&&prevValueProp!==valueProp;return(0,react.useEffect)((()=>{prevIsControlledRef.current=isControlled}),[isControlled]),isControlled?{value:null!=valueProp?valueProp:"",defaultValue:void 0}:{value:void 0,defaultValue:valueProp}}var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");function UnforwardedToggleGroupControlAsRadioGroup({children,isAdaptiveWidth,label,onChange:onChangeProp,size,value:valueProp,id:idProp,...otherProps},forwardedRef){const generatedId=(0,use_instance_id.Z)(ToggleGroupControlAsRadioGroup,"toggle-group-control-as-radio-group"),baseId=idProp||generatedId,{value,defaultValue}=useComputeControlledOrUncontrolledValue(valueProp),wrappedOnChangeProp=onChangeProp?v=>{onChangeProp(null!=v?v:void 0)}:void 0,radio=DYHFBFEH.s({defaultValue,value,setValue:wrappedOnChangeProp}),selectedValue=(0,_2GXGCHW6.Kw)(radio,"value"),setValue=radio.setValue,groupContextValue=(0,react.useMemo)((()=>({baseId,isBlock:!isAdaptiveWidth,size,value:selectedValue,setValue})),[baseId,isAdaptiveWidth,size,selectedValue,setValue]);return(0,jsx_runtime.jsx)(context.Z.Provider,{value:groupContextValue,children:(0,jsx_runtime.jsx)(radio_group.E,{store:radio,"aria-label":label,render:(0,jsx_runtime.jsx)(component.Z,{}),...otherProps,id:baseId,ref:forwardedRef,children})})}UnforwardedToggleGroupControlAsRadioGroup.displayName="UnforwardedToggleGroupControlAsRadioGroup";const ToggleGroupControlAsRadioGroup=(0,react.forwardRef)(UnforwardedToggleGroupControlAsRadioGroup);try{ToggleGroupControlAsRadioGroup.displayName="ToggleGroupControlAsRadioGroup",ToggleGroupControlAsRadioGroup.__docgenInfo={description:"",displayName:"ToggleGroupControlAsRadioGroup",props:{label:{defaultValue:null,description:"Label for the control.",name:"label",required:!0,type:{name:"string"}},children:{defaultValue:null,description:"The options to render in the `ToggleGroupControl`, using either the `ToggleGroupControlOption` or\n`ToggleGroupControlOptionIcon` components.",name:"children",required:!0,type:{name:"ReactNode"}},onChange:{defaultValue:null,description:"Callback when a segment is selected.",name:"onChange",required:!1,type:{name:"(value: string | number) => void"}},size:{defaultValue:{value:"'default'"},description:"The size variant of the control.",name:"size",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"__unstable-large"'}]}},value:{defaultValue:null,description:"The selected value.",name:"value",required:!1,type:{name:"string | number"}},isAdaptiveWidth:{defaultValue:{value:"false"},description:"Determines if segments should be rendered with equal widths.",name:"isAdaptiveWidth",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/toggle-group-control/toggle-group-control/as-radio-group.tsx#ToggleGroupControlAsRadioGroup"]={docgenInfo:ToggleGroupControlAsRadioGroup.__docgenInfo,name:"ToggleGroupControlAsRadioGroup",path:"packages/components/src/toggle-group-control/toggle-group-control/as-radio-group.tsx#ToggleGroupControlAsRadioGroup"})}catch(__react_docgen_typescript_loader_error){}var use_controlled_value=__webpack_require__("./packages/components/src/utils/hooks/use-controlled-value.ts");function UnforwardedToggleGroupControlAsButtonGroup({children,isAdaptiveWidth,label,onChange,size,value:valueProp,id:idProp,...otherProps},forwardedRef){const generatedId=(0,use_instance_id.Z)(ToggleGroupControlAsButtonGroup,"toggle-group-control-as-button-group"),baseId=idProp||generatedId,{value,defaultValue}=useComputeControlledOrUncontrolledValue(valueProp),[selectedValue,setSelectedValue]=(0,use_controlled_value.O)({defaultValue,value,onChange}),groupContextValue=(0,react.useMemo)((()=>({baseId,value:selectedValue,setValue:setSelectedValue,isBlock:!isAdaptiveWidth,isDeselectable:!0,size})),[baseId,selectedValue,setSelectedValue,isAdaptiveWidth,size]);return(0,jsx_runtime.jsx)(context.Z.Provider,{value:groupContextValue,children:(0,jsx_runtime.jsx)(component.Z,{"aria-label":label,...otherProps,ref:forwardedRef,role:"group",children})})}UnforwardedToggleGroupControlAsButtonGroup.displayName="UnforwardedToggleGroupControlAsButtonGroup";const ToggleGroupControlAsButtonGroup=(0,react.forwardRef)(UnforwardedToggleGroupControlAsButtonGroup);try{ToggleGroupControlAsButtonGroup.displayName="ToggleGroupControlAsButtonGroup",ToggleGroupControlAsButtonGroup.__docgenInfo={description:"",displayName:"ToggleGroupControlAsButtonGroup",props:{label:{defaultValue:null,description:"Label for the control.",name:"label",required:!0,type:{name:"string"}},children:{defaultValue:null,description:"The options to render in the `ToggleGroupControl`, using either the `ToggleGroupControlOption` or\n`ToggleGroupControlOptionIcon` components.",name:"children",required:!0,type:{name:"ReactNode"}},onChange:{defaultValue:null,description:"Callback when a segment is selected.",name:"onChange",required:!1,type:{name:"(value: string | number) => void"}},size:{defaultValue:{value:"'default'"},description:"The size variant of the control.",name:"size",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"__unstable-large"'}]}},value:{defaultValue:null,description:"The selected value.",name:"value",required:!1,type:{name:"string | number"}},isAdaptiveWidth:{defaultValue:{value:"false"},description:"Determines if segments should be rendered with equal widths.",name:"isAdaptiveWidth",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/toggle-group-control/toggle-group-control/as-button-group.tsx#ToggleGroupControlAsButtonGroup"]={docgenInfo:ToggleGroupControlAsButtonGroup.__docgenInfo,name:"ToggleGroupControlAsButtonGroup",path:"packages/components/src/toggle-group-control/toggle-group-control/as-button-group.tsx#ToggleGroupControlAsButtonGroup"})}catch(__react_docgen_typescript_loader_error){}function UnconnectedToggleGroupControl(props,forwardedRef){const{__nextHasNoMarginBottom=!1,__next40pxDefaultSize=!1,className,isAdaptiveWidth=!1,isBlock=!1,isDeselectable=!1,label,hideLabelFromVision=!1,help,onChange,size="default",value,children,...otherProps}=(0,use_context_system.y)(props,"ToggleGroupControl"),baseId=(0,use_instance_id.Z)(ToggleGroupControl,"toggle-group-control"),normalizedSize=__next40pxDefaultSize&&"default"===size?"__unstable-large":size,cx=(0,use_cx.I)(),classes=(0,react.useMemo)((()=>cx((({isBlock,isDeselectable,size})=>(0,emotion_react_browser_esm.iv)("background:",colors_values.D.ui.background,";border:1px solid transparent;border-radius:",config_values.Z.radiusSmall,";display:inline-flex;min-width:0;position:relative;",toggleGroupControlSize(size)," ",!isDeselectable&&enclosingBorders(isBlock),";",""))({isBlock,isDeselectable,size:normalizedSize}),isBlock&&block,className)),[className,cx,isBlock,isDeselectable,normalizedSize]),MainControl=isDeselectable?ToggleGroupControlAsButtonGroup:ToggleGroupControlAsRadioGroup;return(0,jsx_runtime.jsxs)(base_control.ZP,{help,__nextHasNoMarginBottom,__associatedWPComponentName:"ToggleGroupControl",children:[!hideLabelFromVision&&(0,jsx_runtime.jsx)(VisualLabelWrapper,{children:(0,jsx_runtime.jsx)(base_control.ZP.VisualLabel,{children:label})}),(0,jsx_runtime.jsx)(MainControl,{...otherProps,className:classes,isAdaptiveWidth,label,onChange,ref:forwardedRef,size:normalizedSize,value,children:(0,jsx_runtime.jsx)(LayoutGroup.S,{id:baseId,children})})]})}UnconnectedToggleGroupControl.displayName="UnconnectedToggleGroupControl";const ToggleGroupControl=(0,context_connect.Iq)(UnconnectedToggleGroupControl,"ToggleGroupControl"),toggle_group_control_component=ToggleGroupControl;try{ToggleGroupControl.displayName="ToggleGroupControl",ToggleGroupControl.__docgenInfo={description:'`ToggleGroupControl` is a form component that lets users choose options\nrepresented in horizontal segments. To render options for this control use\n`ToggleGroupControlOption` component.\n\nThis component is intended for selecting a single persistent value from a set of options,\nsimilar to a how a radio button group would work. If you simply want a toggle to switch between views,\nuse a `TabPanel` instead.\n\nOnly use this control when you know for sure the labels of items inside won\'t\nwrap. For items with longer labels, you can consider a `SelectControl` or a\n`CustomSelectControl` component instead.\n\n```jsx\nimport {\n  __experimentalToggleGroupControl as ToggleGroupControl,\n  __experimentalToggleGroupControlOption as ToggleGroupControlOption,\n} from \'@wordpress/components\';\n\nfunction Example() {\n  return (\n    <ToggleGroupControl\n      label="my label"\n      value="vertical"\n      isBlock\n      __nextHasNoMarginBottom\n    >\n      <ToggleGroupControlOption value="horizontal" label="Horizontal" />\n      <ToggleGroupControlOption value="vertical" label="Vertical" />\n    </ToggleGroupControl>\n  );\n}\n```',displayName:"ToggleGroupControl",props:{help:{defaultValue:null,description:"Additional description for the control.\n\nOnly use for meaningful description or instructions for the control. An element containing the description will be programmatically associated to the BaseControl by the means of an `aria-describedby` attribute.",name:"help",required:!1,type:{name:"ReactNode"}},__nextHasNoMarginBottom:{defaultValue:{value:"false"},description:"Start opting into the new margin-free styles that will become the default in a future version.",name:"__nextHasNoMarginBottom",required:!1,type:{name:"boolean"}},label:{defaultValue:null,description:"Label for the control.",name:"label",required:!0,type:{name:"string"}},hideLabelFromVision:{defaultValue:{value:"false"},description:"If true, the label will only be visible to screen readers.",name:"hideLabelFromVision",required:!1,type:{name:"boolean"}},isAdaptiveWidth:{defaultValue:{value:"false"},description:"Determines if segments should be rendered with equal widths.",name:"isAdaptiveWidth",required:!1,type:{name:"boolean"}},isBlock:{defaultValue:{value:"false"},description:"Renders `ToggleGroupControl` as a (CSS) block element, spanning the entire width of\nthe available space. This is the recommended style when the options are text-based and not icons.",name:"isBlock",required:!1,type:{name:"boolean"}},isDeselectable:{defaultValue:{value:"false"},description:"Whether an option can be deselected by clicking it again.",name:"isDeselectable",required:!1,type:{name:"boolean"}},onChange:{defaultValue:null,description:"Callback when a segment is selected.",name:"onChange",required:!1,type:{name:"(value: string | number) => void"}},value:{defaultValue:null,description:"The selected value.",name:"value",required:!1,type:{name:"string | number"}},children:{defaultValue:null,description:"The options to render in the `ToggleGroupControl`, using either the `ToggleGroupControlOption` or\n`ToggleGroupControlOptionIcon` components.",name:"children",required:!0,type:{name:"ReactNode"}},size:{defaultValue:{value:"'default'"},description:"The size variant of the control.",name:"size",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"__unstable-large"'}]}},__next40pxDefaultSize:{defaultValue:{value:"false"},description:"Start opting into the larger default height that will become the default size in a future version.",name:"__next40pxDefaultSize",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/toggle-group-control/toggle-group-control/component.tsx#ToggleGroupControl"]={docgenInfo:ToggleGroupControl.__docgenInfo,name:"ToggleGroupControl",path:"packages/components/src/toggle-group-control/toggle-group-control/component.tsx#ToggleGroupControl"})}catch(__react_docgen_typescript_loader_error){}}}]);