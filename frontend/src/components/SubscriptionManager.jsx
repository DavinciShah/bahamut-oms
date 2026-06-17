import { useState, useEffect, useMemo } from 'react';
import paymentService from '../services/paymentService';
import PaymentForm from './PaymentForm';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const CURRENCY_META = {
  usd: { code: 'USD', locale: 'en-US', label: 'USD' },
  inr: { code: 'INR', locale: 'en-IN', label: 'INR' },
  aed: { code: 'AED', locale: 'en-AE', label: 'Dinnar (AED)' },
};

function detectCurrencyByLocation() {
  if (typeof window === 'undefined') return 'usd';

  const language = window.navigator?.language || 'en-US';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  let region = '';
  try {
    region = new Intl.Locale(language).region || '';
  } catch {
    const parts = language.split(/[-_]/);
    region = parts[1] || '';
  }
  region = region.toUpperCase();

  if (region === 'IN' || timezone === 'Asia/Kolkata') return 'inr';
  if (region === 'AE' || timezone === 'Asia/Dubai') return 'aed';
  return 'usd';
}

function formatPlanPrice(plan, currencyKey) {
  if (!plan) return 'N/A';

  const currency = CURRENCY_META[currencyKey] || CURRENCY_META.usd;
  const amount = plan?.prices?.[currencyKey] ?? (currencyKey === 'usd' ? plan.price : null);

  if (amount == null) return 'Custom';

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SubscriptionManager({ subscription, onUpdate }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const preferredCurrency = useMemo(() => detectCurrencyByLocation(), []);
  const selectedCurrency = CURRENCY_META[preferredCurrency] ? preferredCurrency : 'usd';
  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === subscription?.plan_id),
    [plans, subscription?.plan_id]
  );

  useEffect(() => {
    paymentService.getPlans().then(res => setPlans(res.data || [])).catch(console.error);
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription?')) return;
    setLoading(true);
    try {
      const res = await paymentService.cancelSubscription();
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      alert('Failed to cancel: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const [showStripeModal, setShowStripeModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);

  const handleUpgrade = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.id === 'free') {
      setLoading(true);
      try {
        const res = await paymentService.updateSubscription(planId);
        if (onUpdate) onUpdate(res.data);
      } catch (err) {
        alert('Failed to update: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
      return;
    }

    const price = plan.prices?.[selectedCurrency] ?? (selectedCurrency === 'usd' ? plan.price : 0);

    if (selectedCurrency === 'inr') {
      setLoading(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      try {
        const orderRes = await paymentService.createRazorpayOrder({
          amount: price,
          currency: 'INR',
          planId: plan.id
        });

        if (!orderRes.data?.success || !orderRes.data?.order) {
          throw new Error('Failed to create Razorpay order');
        }

        const order = orderRes.data.order;
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_razorpay_key',
          amount: order.amount,
          currency: order.currency,
          name: 'De Vibe OMS',
          description: `Upgrade to ${plan.name} Plan`,
          order_id: order.id,
          handler: async function (response) {
            setLoading(true);
            try {
              const verifyRes = await paymentService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id
              });
              if (onUpdate) onUpdate(verifyRes.data.subscription);
              alert('Plan upgraded successfully!');
            } catch (err) {
              alert('Verification failed: ' + (err.response?.data?.error || err.message));
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#3b82f6'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        alert('Payment initialization failed: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    } else {
      setPendingPlan(plan);
      setShowStripeModal(true);
    }
  };

  const handleStripePaymentSuccess = async () => {
    if (!pendingPlan) return;
    setLoading(true);
    setShowStripeModal(false);
    try {
      const res = await paymentService.updateSubscription(pendingPlan.id);
      if (onUpdate) onUpdate(res.data);
      alert('Plan upgraded successfully!');
    } catch (err) {
      alert('Subscription activation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setPendingPlan(null);
    }
  };

  return (
    <div>
      {subscription && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Current Subscription</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              ['Plan', subscription.plan_name || subscription.plan || 'Free'],
              ['Plan Price', formatPlanPrice(currentPlan, selectedCurrency)],
              ['Status', subscription.status],
              ['Billing Cycle', subscription.interval || 'Monthly'],
              ['Next Renewal', subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A']
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
          {subscription.status === 'active' && (
            <button onClick={handleCancel} disabled={loading}
              style={{ marginTop: 16, padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      {plans.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 12 }}>Available Plans</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {plans.map(plan => (
                <div key={plan.id} style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: subscription?.plan_id === plan.id ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{plan.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, margin: '12px 0' }}>
                    {formatPlanPrice(plan, selectedCurrency)}
                    <span style={{ fontSize: 13, fontWeight: 400 }}> /mo · {CURRENCY_META[selectedCurrency].label}</span>
                  </div>
                  {plan.order_limit != null && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                      Order limit: {plan.order_limit.toLocaleString()} orders/month
                    </div>
                  )}
                  <ul style={{ fontSize: 13, color: '#475569', paddingLeft: 16, marginBottom: 16 }}>
                    {(plan.features || []).map((f, i) => <li key={i}>{typeof f === 'string' ? f : f.name || JSON.stringify(f)}</li>)}
                  </ul>
                <button onClick={() => handleUpgrade(plan.id)} disabled={loading || subscription?.plan_id === plan.id}
                  style={{ width: '100%', padding: '8px', background: subscription?.plan_id === plan.id ? '#e2e8f0' : '#3b82f6', color: subscription?.plan_id === plan.id ? '#64748b' : '#fff', border: 'none', borderRadius: 6, cursor: subscription?.plan_id === plan.id ? 'default' : 'pointer' }}>
                  {subscription?.plan_id === plan.id ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showStripeModal && pendingPlan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            maxWidth: 400, width: '100%', position: 'relative', border: '1px solid #e2e8f0', color: '#1e293b'
          }}>
            <button 
              onClick={() => { setShowStripeModal(false); setPendingPlan(null); }}
              style={{
                position: 'absolute', top: 12, right: 12, border: 'none', background: 'none',
                fontSize: 20, cursor: 'pointer', color: '#94a3b8'
              }}
            >
              &times;
            </button>
            <PaymentForm 
              amount={pendingPlan.prices?.[selectedCurrency] ?? pendingPlan.price}
              onSuccess={handleStripePaymentSuccess}
              onError={(msg) => alert('Stripe payment failed: ' + msg)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
