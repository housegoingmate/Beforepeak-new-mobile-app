try { const m = 'react-native-gesture-handler/jestSetup'; require(m); } catch (e) { /* ignore for Snack */ }


jest.mock('react-native-reanimated', () => {
  try { const m = 'react-native-reanimated/mock'; return require(m); } catch { return {}; }
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props) => React.createElement(View, props, props.children);
  const MockMarker = (props) => React.createElement(View, props, props.children);
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

