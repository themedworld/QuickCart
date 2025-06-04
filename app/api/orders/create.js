// pages/api/orders/create.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { token, orderData } = req.body;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WP_API}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: result.message || 'Erreur WooCommerce' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Erreur interne serveur' });
  }
}
