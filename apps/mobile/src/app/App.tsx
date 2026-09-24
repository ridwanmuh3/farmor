import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import { ShopProvider } from '../presentation/components/ShopProvider';
import { BuyerTabs, SellerTabs } from '../presentation/components/Tabs';
import { Splash, Onboarding, Login, Register, ForgotPassword } from '../presentation/pages/AuthPages';
import { ProductDetail } from '../presentation/pages/ProductDetail';
import { Checkout } from '../presentation/pages/Checkout';
import { OrderHistory, OrderDetail } from '../presentation/pages/OrderHistory';
import { OrderReceipt } from '../presentation/pages/OrderReceipt';
import { DeliveryTracking, AddressBook } from '../presentation/pages/Tracking';
import { Notifications, Wishlist, ChatTeaser } from '../presentation/pages/Extras';
import { SimpleInfo } from '../presentation/pages/Profile';

const App = () => (
  <IonApp>
    <IonReactRouter>
      <ShopProvider>
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
      </ShopProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
