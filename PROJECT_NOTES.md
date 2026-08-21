# ملاحظات مشروع العميل المستقل

## المصدر والترخيص

المصدر الأساسي هو `https://github.com/DrKLO/Telegram`، وهو مصدر Telegram الرسمي لأندرويد. ينص README على أن التطبيق المعدل يجب أن يستخدم `api_id` خاصًا به، وألا يستخدم اسم Telegram أو شعاره القياسي بطريقة توهم المستخدم بأنه رسمي، وأن ينشر الموزع مصدر تعديلاته. يحمل المستودع رخصة GPL-2.0.

## متطلبات البناء المنشورة

يوثق README الحاجة إلى Android Studio 2025.1.4 وAndroid SDK 35 وAndroid NDK 27.2.12479018. كما يطلب للموزع استبدال ملفات التوقيع وFirebase وملء المتغيرات الخاصة في `BuildVars.java` قبل النشر.

## نطاق التعديل الآمن

يسمح العميل فقط بمعالجة الملفات والرسائل والقصص التي يملك المستخدم الوصول الطبيعي إليها. لا يضيف استرجاعًا للرسائل المحذوفة، ولا عرضًا لمحتوى مقفل، ولا تجاوزًا لقيود الوصول.

## المصادر

1. https://github.com/DrKLO/Telegram
2. https://raw.githubusercontent.com/DrKLO/Telegram/master/README.md
3. https://raw.githubusercontent.com/DrKLO/Telegram/master/LICENSE
