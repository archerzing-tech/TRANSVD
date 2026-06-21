#!/bin/bash
set -e

# Generate a development signing keystore for Android APK signing in CI.
# This ensures the APK can be installed on Android devices.
# For production Google Play releases, replace with a securely stored keystore.

KEYSTORE="src-tauri/transvd.keystore"
GRADLE_FILE="src-tauri/gen/android/app/build.gradle.kts"

# Generate keystore only if it doesn't exist yet
# (tauri android init may already create one)
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkey -v -keystore "$KEYSTORE" \
    -storepass transvd2024 -alias transvd -keypass transvd2024 \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=TRANSVD, OU=Development, O=TRANSVD, L=Unknown, ST=Unknown, C=CN"
  echo "Keystore generated at $KEYSTORE"
else
  echo "Keystore already exists at $KEYSTORE, skipping generation"
fi

# Patch build.gradle.kts with signing config
# (tauri android init regenerates this file, so we must re-add signing)

python3 << 'PYEOF'
with open('src-tauri/gen/android/app/build.gradle.kts', 'r') as f:
    content = f.read()

signing_configs_block = """    signingConfigs {
        create("release") {
            val keystorePath = rootProject.projectDir.parentFile.parentFile.parentFile
                .resolve("src-tauri/transvd.keystore")
            if (keystorePath.exists()) {
                storeFile = keystorePath
                storePassword = "transvd2024"
                keyAlias = "transvd"
                keyPassword = "transvd2024"
            }
        }
    }
""".rstrip("\n")

# Insert signingConfigs block between defaultConfig closing brace and buildTypes.
content = content.replace(
    "    }\n\n    buildTypes {",
    "    }\n" + signing_configs_block + "\n\n    buildTypes {"
)

# Add signingConfig to release build type
content = content.replace(
    'getByName("release") {\n            isMinifyEnabled = true',
    'getByName("release") {\n            signingConfig = signingConfigs.getByName("release")\n            isMinifyEnabled = true'
)

with open('src-tauri/gen/android/app/build.gradle.kts', 'w') as f:
    f.write(content)

print('Signing config injected into build.gradle.kts')
PYEOF
