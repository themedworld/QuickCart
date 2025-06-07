// app/api/products/route.js
export async function GET(req) {
  const key = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
  const secret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
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
