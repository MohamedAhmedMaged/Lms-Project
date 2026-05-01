import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../../api/cartApi";
import { paymentApi } from "../../api/paymentApi";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert";
import { Trash2, ShoppingBag, Tag, CreditCard } from "lucide-react";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchCart = async () => {
    try {
      const res = await cartApi.getCart();
      setCart(res.data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (courseId) => {
    try {
      const res = await cartApi.removeItem(courseId);
      setCart(res.data.data);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to remove item",
      });
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      setCart(res.data.data);
    } catch (err) {
      setMsg({ type: "error", text: "Failed to clear cart" });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await cartApi.applyCoupon(couponCode);
      setCart(res.data.data);
      setMsg({ type: "success", text: "Coupon applied!" });
      setCouponCode("");
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Invalid coupon",
      });
    }
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const checkout = async () => {
    try {
      const res = await paymentApi.createCheckout({});
      const sessionUrl = res.data.data?.checkoutUrl;
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        setMsg({ type: "error", text: "Failed to create checkout session" });
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Checkout failed",
      });
    }
  };

  if (loading) return <Loader />;

  const items = cart?.items || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {msg.text && (
        <Alert
          type={msg.type}
          message={msg.text}
          onClose={() => setMsg({ type: "", text: "" })}
        />
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            Your cart is empty
          </h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Browse courses and add them to your cart
          </p>
          <button onClick={() => navigate("/courses")} className="btn-primary">
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.course?.id || item.course}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.course?.title || "Course"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.course?.level || ""}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">
                  ${item.price}
                </span>
                <button
                  onClick={() => removeItem(item.course?.id || item.course)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear Cart
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${cart?.totalAmount || 0}</span>
              </div>
              {cart?.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discountAmount}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                onClick={applyCoupon}
                className="btn-secondary text-sm gap-1"
              >
                <Tag size={14} /> Apply
              </button>
            </div>

            <button onClick={checkout} className="btn-primary w-full gap-2">
              <CreditCard size={18} /> Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
