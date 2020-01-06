#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNReactNativeGutenbergBridge, NSObject)

RCT_EXTERN_METHOD(provideToNative_Html:(NSString *)html title:(NSString *)title changed:(BOOL)changed)
RCT_EXTERN_METHOD(requestMediaPickFrom:(NSString *)source filter:(NSArray<NSString *> *)filter allowMultipleSelection:(BOOL)allowMultipleSelection callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(getOtherMediaOptions:(NSArray<NSString *> *)filter callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(mediaUploadSync)
RCT_EXTERN_METHOD(requestImageFailedRetryDialog:(int)mediaID)
RCT_EXTERN_METHOD(requestImageUploadCancelDialog:(int)mediaID)
RCT_EXTERN_METHOD(requestImageUploadCancel:(int)mediaID)
RCT_EXTERN_METHOD(requestMediaImport:(NSString *)sourceURL callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(editorDidLayout)
RCT_EXTERN_METHOD(editorDidMount:(NSArray *)unsupportedBlockNames)
RCT_EXTERN_METHOD(editorDidEmitLog:(NSString *)message logLevel:(int)logLevel)
RCT_EXTERN_METHOD(editorDidAutosave)
RCT_EXTERN_METHOD(fetchRequest:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(requestImageFullscreenPreview:(NSString *)mediaUrl)

@end
