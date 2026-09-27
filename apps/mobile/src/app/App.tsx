import { Suspense, lazy } from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import { ShopProvider } from '../presentation/components/ShopProvider';
import { ErrorBoundary } from '../presentation/components/ErrorBoundary';
import { BuyerTabs, SellerTabs } from '../presentation/components/Tabs';
import { Splash, Onboarding, Login, Register, ForgotPassword } from '../presentation/pages/AuthPages';
import { SimpleInfo } from '../presentation/pages/Profile';

/*
 * Layar non-tab dimuat saat dibutuhkan (React.lazy) supaya bundel awal cukup
 * untuk masuk dan tab utama. Tab pembeli/penjual tetap eager: kotak tabnya
 * selalu terlihat, jadi memuatnya lambat hanya akan menambah kedipan.
 */
const ProductDetail = lazy(() => import('../presentation/pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Checkout = lazy(() => import('../presentation/pages/Checkout').then((m) => ({ default: m.Checkout })));
const OrderHistory = lazy(() => import('../presentation/pages/OrderHistory').then((m) => ({ default: m.OrderHistory })));
const OrderDetail = lazy(() => import('../presentation/pages/OrderHistory').then((m) => ({ default: m.OrderDetail })));
const OrderReceipt = lazy(() => import('../presentation/pages/OrderReceipt').then((m) => ({ default: m.OrderReceipt })));
const DeliveryTracking = lazy(() => import('../presentation/pages/Tracking').then((m) => ({ default: m.DeliveryTracking })));
const AddressBook = lazy(() => import('../presentation/pages/Tracking').then((m) => ({ default: m.AddressBook })));
const Notifications = lazy(() => import('../presentation/pages/Extras').then((m) => ({ default: m.Notifications })));
const Wishlist = lazy(() => import('../presentation/pages/Extras').then((m) => ({ default: m.Wishlist })));
const ChatTeaser = lazy(() => import('../presentation/pages/Extras').then((m) => ({ default: m.ChatTeaser })));

const App = () => (
  <IonApp>
    <IonReactRouter>
      <ShopProvider>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <IonRouterOutlet>
              {/* Alur masuk */}
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot" element={<ForgotPassword />} />

              {/* Belanja */}
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/receipt/:groupId" element={<OrderReceipt />} />
              <Route path="/tracking/:id" element={<DeliveryTracking />} />
              <Route path="/addresses" element={<AddressBook />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/chat" element={<ChatTeaser />} />

              {/* Statis */}
              <Route path="/help" element={<SimpleInfo title="Pusat Bantuan" />} />
              <Route path="/terms" element={<SimpleInfo title="Syarat & Ketentuan" />} />
              <Route path="/about" element={<SimpleInfo title="Tentang Farmor" />} />

              {/* Tab pembeli & penjual */}
              <Route path="/tabs/*" element={<BuyerTabs />} />
              <Route path="/seller/*" element={<SellerTabs />} />

              <Route path="*" element={<Navigate to="/tabs/home" replace />} />
            </IonRouterOutlet>
          </Suspense>
        </ErrorBoundary>
      </ShopProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
