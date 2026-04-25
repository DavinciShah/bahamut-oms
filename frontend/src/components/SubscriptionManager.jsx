import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

export default function SubscriptionManager({ subscription, onUpdate }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      const res = await paymentService.updateSubscription(planId);
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
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
                <div style={{ fontSize: 24, fontWeight: 700, margin: '12px 0' }}>${plan.price}<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span></div>
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
    </div>
  );
}
