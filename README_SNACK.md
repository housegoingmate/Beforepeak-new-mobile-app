# BeforePeak Mobile – Snack Preview

Use this branch/export for running on Expo Snack to validate UI/UX. Native-only pieces are stubbed:

- Haptics → no-op in Snack (utils/haptics.ts)
- Maps & geolocation → placeholders and mocked address suggestions
- FastImage → falls back to Image
- WebView/Permissions → avoid on Snack flows

How to copy to Snack:
1. Create Snack (https://snack.expo.dev) and choose React Native.
2. Paste App.tsx and the src folder (omit services that need secrets).
3. Add minimal dependencies or rely on snack’s managed ones; see package.snack.json for guidance.
4. Start the Snack in iOS/Android web players; interact with navigation and screens.

When moving back to device builds, native modules re‑enable automatically.

