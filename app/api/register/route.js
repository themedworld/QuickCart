// app/api/register/route.js
export async function POST(req) {
  try {
    const body = await req.json();

    const { email, first_name, last_name, username, password } = body;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const secret = process.env.woo_commerce_client_secret;
    const key = process.env.woo_commerce_client_key;

    const response = await fetch(`${apiBaseUrl}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'),
      },
      body: JSON.stringify({
        email,
        first_name,
        last_name,
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ message: data.message || 'Erreur API WooCommerce' }), {
        status: response.status
      });
    }

    return new Response(JSON.stringify({ message: 'Utilisateur créé avec succès', data }), {
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}
