# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep Lottie animations
-keep class com.airbnb.lottie.** { *; }

# Keep interfaces for JNI
-keepclasseswithmembernames class * {
    native <methods>;
}

# Allow shrinking of everything else
