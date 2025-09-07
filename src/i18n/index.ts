import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
let RNLocalize: any = {};
try { const mod = 'react-native-localize'; RNLocalize = require(mod); } catch {}


export type AppLanguage = 'en' | 'zh-HK';

const resources = {
  en: {
    translation: {
      // Tabs
      tab_home: 'Home',
      tab_restaurants: 'Search',
      tab_bookings: 'Bookings',
      tab_referrals: 'Referrals',
      tab_profile: 'Profile',

      // Header
      brand: 'BeforePeak',
      sign_in_up: 'Sign In / Sign Up',
      profile: 'Profile',

      // Home
      home_tagline: 'Beat the Rush. Save Big.',
      home_title: "Discover Hong Kong's Best Early Bird Dining Deals",
      home_subtitle: 'Book premium restaurants at off-peak hours and save 50% on your dining experience.',
      home_featured: 'Featured Restaurants',
      home_browse_all: 'Browse All Restaurants',
      home_my_bookings: 'My Bookings',
      home_how_it_works: 'How it Works',
      home_hiw_point1: 'Choose non-peak hours and enjoy 50% off',
      home_hiw_point2: 'Book up to two weeks in advance',
      home_hiw_point3: 'Free cancellation up to 12 hours before',

      // Search screen
      search_title: 'Search Restaurants',
      search_placeholder: 'Search restaurant names or cuisines',
      search_button: 'Search',
      sort_label: 'Sort:',
      sort_rating: 'Top rated',
      sort_reviews: 'Most reviewed',
      sort_relevance: 'Relevance',
    },
  },
  'zh-HK': {
    translation: {
      // Tabs
      tab_home: '首頁',
      tab_restaurants: '搜尋',
      tab_bookings: '預訂',
      tab_referrals: '推薦',
      tab_profile: '我的',

      // Header
      brand: 'BeforePeak',
      sign_in_up: '登入 / 註冊',
      profile: '個人中心',

      // Home
      home_tagline: '快人一步，慳多幾舊',
      home_title: '發掘香港最佳早鳥餐飲優惠',
      home_subtitle: '在非繁忙時段預訂優質餐廳，享受50%的餐飲體驗折扣。',
      home_featured: '精選餐廳',
      home_browse_all: '瀏覽所有餐廳',
      home_my_bookings: '我的預訂',
      home_how_it_works: '如何運作',
      home_hiw_point1: '選擇非繁忙時段享受 50% 折扣',
      home_hiw_point2: '最多可提前兩週預訂',
      home_hiw_point3: '12 小時前可免費取消',

      // Search screen
      search_title: '搜尋餐廳',
      search_placeholder: '搜尋餐廳名稱或菜式',
      search_button: '搜尋',
      sort_label: '排序:',
      sort_rating: '評分最高',
      sort_reviews: '最多評價',
      sort_relevance: '相關度',
    },
  },
};

const locales = RNLocalize.getLocales();
const rawDevice = Array.isArray(locales) && locales.length > 0 ? locales[0].languageTag : 'en';
const normalizedDevice: AppLanguage = rawDevice?.toLowerCase().startsWith('zh') ? 'zh-HK' : 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: normalizedDevice,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
export { resources };
