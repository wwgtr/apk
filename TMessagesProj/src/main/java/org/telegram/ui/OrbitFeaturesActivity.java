package org.telegram.ui;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.OrbitFontManager;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ActionBar.Theme;

/** Settings entry point for independent, device-local client enhancements. */
public class OrbitFeaturesActivity extends BaseFragment {
    private static final int REQUEST_FONT = 731;

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(org.telegram.messenger.R.drawable.ic_ab_back);
        actionBar.setTitle("Orbit tools");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) finishFragment();
            }
        });

        ScrollView scroll = new ScrollView(context);
        LinearLayout content = new LinearLayout(context);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(AndroidUtilities.dp(20), AndroidUtilities.dp(18), AndroidUtilities.dp(20), AndroidUtilities.dp(30));
        scroll.addView(content);
        fragmentView = scroll;

        addTitle(context, content, "واجهة شخصية ومحلية");
        addDescription(context, content, "تعمل هذه الميزات على جهازك فقط ولا تكشف رسائل محذوفة أو محتوى مقفل أو غير متاح لحسابك.");
        addTitle(context, content, "خط التطبيق");
        addDescription(context, content, OrbitFontManager.usesCustomFont() ? "يوجد خط مخصص نشط الآن." : "اختر ملف TTF أو OTF مرخصًا لك لاستخدامه. سيطبق على النصوص التي تستخدم خط واجهة التطبيق.");

        Button importFont = addButton(context, content, "استيراد وتطبيق خط TTF أو OTF");
        importFont.setOnClickListener(v -> openFontPicker());
        Button resetFont = addButton(context, content, "استعادة الخط الافتراضي");
        resetFont.setOnClickListener(v -> {
            OrbitFontManager.clear(context);
            restartInterface();
        });

        addTitle(context, content, "الإنتاجية والخصوصية");
        addDescription(context, content, "الإصدار التالي من العميل يربط هذه الصفحة بعلامات الرسائل المحلية، مسودات متعددة، جدول تنبيهات لكل محادثة، وقفل محادثات على الجهاز. لا تغير هذه الخيارات صلاحيات Telegram ولا تتجاوزها.");
        Button deviceSecurity = addButton(context, content, "إعداد قفل الجهاز");
        deviceSecurity.setOnClickListener(v -> startActivityForResult(new Intent(Settings.ACTION_SECURITY_SETTINGS), 0));
        return fragmentView;
    }

    private void openFontPicker() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/octet-stream");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(intent, REQUEST_FONT);
    }

    @Override
    public void onActivityResultFragment(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQUEST_FONT || resultCode != Activity.RESULT_OK || data == null) return;
        Uri uri = data.getData();
        if (uri != null && OrbitFontManager.importFont(getContext(), uri)) {
            restartInterface();
        } else {
            android.widget.Toast.makeText(getContext(), "تعذر قراءة الخط. اختر ملف TTF أو OTF صالحًا.", android.widget.Toast.LENGTH_SHORT).show();
        }
    }

    private void restartInterface() {
        if (getParentActivity() != null) getParentActivity().recreate();
    }

    private void addTitle(Context context, LinearLayout parent, String value) {
        TextView view = new TextView(context);
        view.setText(value);
        view.setTextColor(Theme.getColor(Theme.key_windowBackgroundWhiteBlueHeader));
        view.setTextSize(17);
        view.setGravity(Gravity.START);
        view.setPadding(0, AndroidUtilities.dp(12), 0, AndroidUtilities.dp(4));
        parent.addView(view);
    }

    private void addDescription(Context context, LinearLayout parent, String value) {
        TextView view = new TextView(context);
        view.setText(value);
        view.setTextColor(Theme.getColor(Theme.key_windowBackgroundWhiteGrayText2));
        view.setTextSize(14);
        view.setLineSpacing(AndroidUtilities.dp(3), 1f);
        parent.addView(view);
    }

    private Button addButton(Context context, LinearLayout parent, String label) {
        Button button = new Button(context);
        button.setText(label);
        button.setTextColor(Color.WHITE);
        button.setTextSize(14);
        button.setAllCaps(false);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, AndroidUtilities.dp(48));
        params.topMargin = AndroidUtilities.dp(10);
        parent.addView(button, params);
        return button;
    }
}
