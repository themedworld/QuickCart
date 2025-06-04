// app/api/products/route.js
export async function GET(req) {
  const key = process.env.woo_commerce_client_key;
  const secret = process.env.woo_commerce_client_secret;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const basicAuth = Buffer.from(`${key}:${secret}`).toString('base64');

  const response = await fetch(`${apiUrl}/wp-json/wc/v3/products`, {
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  return Response.json(data);
}
