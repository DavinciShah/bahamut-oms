import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import InvoiceList from '../components/InvoiceList';
import SubscriptionManager from '../components/SubscriptionManager';
import PaymentHistory from '../components/PaymentHistory';

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('subscription');

  useEffect(() => {
    paymentService.getSubscription()
      .then(res => setSubscription(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'subscription', label: 'Subscription' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'history', label: 'Payment History' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Billing & Subscription</h2>
      {subscription && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Current Plan: {subscription.plan_name || subscription.plan || 'Free'}</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
            Status: <span style={{ color: subscription.status === 'active' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>{subscription.status}</span>
            {subscription.current_period_end && ` · Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
              color: tab === t.key ? '#3b82f6' : '#64748b', marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          {tab === 'subscription' && <SubscriptionManager subscription={subscription} onUpdate={setSubscription} />}
          {tab === 'invoices' && <InvoiceList />}
          {tab === 'history' && <PaymentHistory />}
        </>
      )}
    </div>
  );
}
