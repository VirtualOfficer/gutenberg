package org.wordpress.mobile.ReactNativeGutenbergBridge;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;

import org.wordpress.mobile.WPAndroidGlue.MediaOption;
import org.wordpress.mobile.WPAndroidGlue.RequestExecutor;

import java.util.ArrayList;
import java.util.List;

public interface GutenbergBridgeJS2Parent extends RequestExecutor {
    interface RNMedia {
        String getUrl();
        int getId();
        String getType();
        WritableMap toMap();
    }

    void responseHtml(String title, String html, boolean changed);

    void editorDidMount(ReadableArray unsupportedBlockNames);

    interface OtherMediaOptionsReceivedCallback {
        void onOtherMediaOptionsReceived(ArrayList<MediaOption> mediaList);
    }

    interface MediaUploadCallback {
        void onUploadMediaFileSelected(List<RNMedia> mediaList);
        void onUploadMediaFileClear(int mediaId);
        void onMediaFileUploadProgress(int mediaId, float progress);
        void onMediaFileUploadSucceeded(int mediaId, String mediaUrl, int serverId);
        void onMediaFileUploadFailed(int mediaId);
    }

    // Ref: https://github.com/facebook/react-native/blob/master/Libraries/polyfills/console.js#L376
    enum LogLevel {
        TRACE(0),
        INFO(1),
        WARN(2),
        ERROR(3);

        private final int id;

        LogLevel(int id) {
            this.id = id;
        }

        public static LogLevel valueOf(int id) {
            for (LogLevel num : values()) {
                if (num.id == id) {
                    return num;
                }
            }
            return null;
        }
    }

    enum MediaType {
        IMAGE("image"),
        VIDEO("video"),
        MEDIA("media"),
        AUDIO("audio"),
        OTHER("other");

        String name;

        MediaType(String name) {
            this.name = name;
        }

        public static MediaType getEnum(String value) {
            for (MediaType mediaType : values()) {
                if (mediaType.name.equals(value)) {
                    return mediaType;
                }
            }

            return OTHER;
        }
    }

    void requestMediaPickFromMediaLibrary(MediaUploadCallback mediaUploadCallback, Boolean allowMultipleSelection, MediaType mediaType);

    void requestMediaPickFromDeviceLibrary(MediaUploadCallback mediaUploadCallback, Boolean allowMultipleSelection, MediaType mediaType);

    void requestMediaPickerFromDeviceCamera(MediaUploadCallback mediaUploadCallback, MediaType mediaType);

    void requestMediaImport(String url, MediaUploadCallback mediaUploadCallback);

    void mediaUploadSync(MediaUploadCallback mediaUploadCallback);

    void requestImageFailedRetryDialog(int mediaId);

    void requestImageUploadCancelDialog(int mediaId);

    void requestImageUploadCancel(int mediaId);

    void editorDidEmitLog(String message, LogLevel logLevel);

    void editorDidAutosave();

    void getOtherMediaPickerOptions(OtherMediaOptionsReceivedCallback otherMediaOptionsReceivedCallback, MediaType mediaType);

    void requestMediaPickFrom(String mediaSource, MediaUploadCallback mediaUploadCallback, Boolean allowMultipleSelection);

    void requestImageFullscreenPreview(String mediaUrl);
}
