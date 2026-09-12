/**
 * Cloudshelf client adapter.
 * Browser-safe: no API key is stored here.
 * All authenticated API calls should go through the server/Firebase Functions layer.
 */
window.Cloudshelf = window.Cloudshelf || {
  async request(action, payload = {}) {
    const endpoint = window.CLOUDSHELF_FUNCTION_URL || '/api/cloudshelf';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    if (!response.ok) throw new Error(`Cloudshelf request failed: ${response.status}`);
    return response.json();
  },
  catalog: (payload) => window.Cloudshelf.request('catalog', payload),
  products: (payload) => window.Cloudshelf.request('products', payload),
  createCheckout: (payload) => window.Cloudshelf.request('createCheckout', payload),
  reportPurchase: (payload) => window.Cloudshelf.request('reportPurchase', payload)
};
