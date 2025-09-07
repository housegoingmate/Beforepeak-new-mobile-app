# Expo Snack Setup for BeforePeak Mobile (UI/UX preview)

This Snack is to preview UI/UX flows. Snack restricts many native modules; we temporarily leave them out and document all differences here.

What works in Snack:
- Navigation, screens, and layout
- Ionicons from `@expo/vector-icons`
- Maps and WebView with SDK 53–recommended versions
- Supabase calls that only use HTTPS (no secrets)
- Static UI states for lists/cards/filters

Temporarily excluded or degraded in Snack:
- `react-native-localize`: removed from deps; runtime attempts to require it, else default locale is `en`
- `react-native-fast-image`: gracefully falls back to React Native `Image` in Snack; native builds can re-enable FastImage
- `react-native-haptic-feedback`: wrapped; no-op on Snack
- Permissions/geolocation: not used on Snack flows to avoid permission prompts
- Deep links like `tel:` may not work in web preview (OK on device)

Plan after UI/UX sign-off (native builds):
- Re-add `react-native-localize` and wire device locale switching fully
- Use FastImage for better caching/perf
- Implement real payments (PayMe), permissions, and any native-only flows

How to run on Snack:
1. Open on https://snack.expo.dev and import this folder
2. Ensure package.snack.json contains Expo SDK 53–compatible versions (already provided)
3. Avoid adding extra native-only packages

Notes:
- Keep API keys out of Snack or use mocked data
- This is for design/interaction preview only; bookings/payments/reviews should be tested on device builds

