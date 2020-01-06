package org.wordpress.mobile.WPAndroidGlue;

import androidx.annotation.NonNull;

import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent.MediaType;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent.RNMedia;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class Media implements RNMedia {
    private int mId;
    private String mUrl;
    private String mType;

    public Media(int id, String url, String type) {
        this.mId = id;
        this.mUrl = url;
        this.mType = type;
    }

    public Media(int id, String url) {
        this.mId = id;
        this.mUrl = url;
        this.mType = "";
    }

    public static Media createRNMediaUsingMimeType(final int id, final String url, @NonNull final String mimeType) {
        String type;

        if (mimeType.startsWith(MediaType.IMAGE.name().toLowerCase())) {
            type =  MediaType.IMAGE.name().toLowerCase();
        } else if (mimeType.startsWith(MediaType.VIDEO.name().toLowerCase())) {
            type =  MediaType.VIDEO.name().toLowerCase();
        } else {
            type = MediaType.OTHER.name().toLowerCase();
        }

        return new Media(id, url, type);
    }


    public int getId() {
        return mId;
    }

    public void setId(int id) {
        this.mId = id;
    }

    public String getUrl() {
        return mUrl;
    }

    public void setUrl(String url) {
        this.mUrl = url;
    }

    public String getType() {
        return mType;
    }

    public void setType(String mediaType) {
        this.mType = mediaType;
    }

    public WritableMap toMap() {
        WritableMap map = new WritableNativeMap();
        map.putInt("id", mId);
        map.putString("url", mUrl);
        map.putString("type", mType);
        return map;
    }
}
