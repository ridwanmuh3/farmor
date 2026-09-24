import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet } from '@ionic/react';
import { Home, Search, ShoppingCart, User, LayoutDashboard, Package, ClipboardList } from 'lucide-react';
import { Navigate, Route } from 'react-router-dom';
import { Home as BuyerHome, Explore } from '../pages/BuyerHome';
import { Cart } from '../pages/Cart';
import { Profile } from '../pages/Profile';
import { SellerDashboard, SellerOrders, SellerProducts, SellerAddProduct } from '../pages/SellerPages';

const icon = { size: 22, 'aria-hidden': true } as const;

/** Tab bawah pembeli. IonTabs menyimpan state tiap tab saat berpindah. */
export const BuyerTabs = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/tabs/home" element={<BuyerHome />} />
      <Route path="/tabs/explore" element={<Explore />} />
      <Route path="/tabs/cart" element={<Cart />} />
      <Route path="/tabs/profile" element={<Profile />} />
      <Route index element={<Navigate to="/tabs/home" replace />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/tabs/home">
        <Home {...icon} />
        <span className="ff-tab-label">Beranda</span>
      </IonTabButton>
      <IonTabButton tab="explore" href="/tabs/explore">
        <Search {...icon} />
        <span className="ff-tab-label">Jelajah</span>
      </IonTabButton>
      <IonTabButton tab="cart" href="/tabs/cart">
        <ShoppingCart {...icon} />
        <span className="ff-tab-label">Keranjang</span>
      </IonTabButton>
      <IonTabButton tab="profile" href="/tabs/profile">
        <User {...icon} />
        <span className="ff-tab-label">Profil</span>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

/** Tab bawah penjual. */
export const SellerTabs = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/products" element={<SellerProducts />} />
      <Route path="/seller/orders" element={<SellerOrders />} />
      <Route path="/seller/add" element={<SellerAddProduct />} />
      <Route path="/seller/profile" element={<Profile />} />
      <Route index element={<Navigate to="/seller/dashboard" replace />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="dashboard" href="/seller/dashboard">
        <LayoutDashboard {...icon} />
        <span className="ff-tab-label">Dasbor</span>
      </IonTabButton>
      <IonTabButton tab="products" href="/seller/products">
        <Package {...icon} />
        <span className="ff-tab-label">Produk</span>
      </IonTabButton>
      <IonTabButton tab="orders" href="/seller/orders">
        <ClipboardList {...icon} />
        <span className="ff-tab-label">Pesanan</span>
      </IonTabButton>
      <IonTabButton tab="profile" href="/seller/profile">
        <User {...icon} />
        <span className="ff-tab-label">Profil</span>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);
