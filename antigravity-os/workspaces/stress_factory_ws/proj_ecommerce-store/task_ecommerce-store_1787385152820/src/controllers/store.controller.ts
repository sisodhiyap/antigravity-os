import { CatalogService } from '../services/catalog.service';
import { CartService } from '../services/cart.service';
import { DiscountService } from '../services/discount.service';
import { CheckoutService } from '../services/checkout.service';
export class StoreController { public catalog = new CatalogService(); public cart = new CartService(); public discounts = new DiscountService(); public checkout = new CheckoutService(this.cart, this.discounts); }