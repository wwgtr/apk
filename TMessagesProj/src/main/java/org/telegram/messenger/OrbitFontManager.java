package org.telegram.messenger;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.net.Uri;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Locale;

/**
 * Local-only font support for the independent client. Fonts are supplied by the
 * user through Android's document picker and are never uploaded or shared.
 */
public final class OrbitFontManager {
    private static final String PREFS = "orbit_client_features";
    private static final String ACTIVE_FONT = "active_font";
    private static final String FONT_FILE = "ui_font.bin";
    private static final long MAX_FONT_BYTES = 15L * 1024L * 1024L;
    private static Typeface customTypeface;

    private OrbitFontManager() { }

    private static File getFontDirectory(Context context) {
        File directory = new File(context.getFilesDir(), "orbit_fonts");
        if (!directory.exists()) directory.mkdirs();
        return directory;
    }

    private static File getActiveFile(Context context) {
        return new File(getFontDirectory(context), FONT_FILE);
    }

    public static synchronized Typeface override(String assetPath, Typeface original) {
        if (original == null || !usesCustomFont() || !isTextTypeface(assetPath)) return original;
        if (customTypeface == null) {
            try {
                customTypeface = Typeface.createFromFile(getActiveFile(ApplicationLoader.applicationContext));
            } catch (Throwable ignore) {
                clear(ApplicationLoader.applicationContext);
                return original;
            }
        }
        return customTypeface == null ? original : customTypeface;
    }

    private static boolean isTextTypeface(String assetPath) {
        return assetPath != null && (assetPath.contains("fonts/") || assetPath.contains("roboto"));
    }

    public static boolean isSupportedFontName(String name) {
        if (name == null) return false;
        String normalized = name.toLowerCase(Locale.US);
        return normalized.endsWith(".ttf") || normalized.endsWith(".otf");
    }

    public static synchronized boolean importFont(Context context, Uri uri) {
        if (context == null || uri == null) return false;
        try (InputStream input = context.getContentResolver().openInputStream(uri)) {
            return importFont(context, input);
        } catch (Throwable error) {
            FileLog.e(error);
            return false;
        }
    }

    public static synchronized boolean importFont(Context context, File source) {
        if (context == null || source == null || !source.isFile()) return false;
        try (InputStream input = new FileInputStream(source)) {
            return importFont(context, input);
        } catch (Throwable error) {
            FileLog.e(error);
            return false;
        }
    }

    private static boolean importFont(Context context, InputStream input) {
        if (context == null || input == null) return false;
        File destination = getActiveFile(context);
        File temporary = new File(destination.getParentFile(), "pending_font.bin");
        try (FileOutputStream output = new FileOutputStream(temporary)) {
            byte[] buffer = new byte[8192];
            long total = 0;
            int read;
            while ((read = input.read(buffer)) != -1) {
                total += read;
                if (total > MAX_FONT_BYTES) throw new IllegalArgumentException("Font file is too large");
                output.write(buffer, 0, read);
            }
        } catch (Throwable error) {
            temporary.delete();
            FileLog.e(error);
            return false;
        }
        if (!isTtfOrOtf(temporary)) {
            temporary.delete();
            return false;
        }
        try {
            Typeface tested = Typeface.createFromFile(temporary);
            if (tested == null) throw new IllegalArgumentException("Unsupported font");
            if (destination.exists()) destination.delete();
            if (!temporary.renameTo(destination)) throw new IllegalStateException("Cannot store font");
            getPreferences(context).edit().putBoolean(ACTIVE_FONT, true).apply();
            customTypeface = tested;
            return true;
        } catch (Throwable error) {
            temporary.delete();
            FileLog.e(error);
            return false;
        }
    }

    private static boolean isTtfOrOtf(File file) {
        try (FileInputStream input = new FileInputStream(file)) {
            byte[] header = new byte[4];
            if (input.read(header) != 4) return false;
            boolean trueType = header[0] == 0 && header[1] == 1 && header[2] == 0 && header[3] == 0;
            boolean openType = header[0] == 'O' && header[1] == 'T' && header[2] == 'T' && header[3] == 'O';
            return trueType || openType;
        } catch (Throwable ignore) {
            return false;
        }
    }

    public static synchronized void clear(Context context) {
        getPreferences(context).edit().remove(ACTIVE_FONT).apply();
        File file = getActiveFile(context);
        if (file.exists()) file.delete();
        customTypeface = null;
    }

    public static boolean usesCustomFont() {
        return getPreferences(ApplicationLoader.applicationContext).getBoolean(ACTIVE_FONT, false);
    }

    private static SharedPreferences getPreferences(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
