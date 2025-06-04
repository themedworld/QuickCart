export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });}
  
  try {
    const { username, email, password, first_name, last_name, role, shop_name, phone } = req.body;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
    // Vérification des champs requis
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    // Configuration de base pour les requêtes à l'API WordPress
    const wpApiUrl = `${apiBaseUrl}/wp-json/wp/v/users`;
    
    // Pour WooCommerce, on utilise plutôt 'customer' ou 'seller' comme rôle
    const woocommerceRole = role === 'vendor' ? 'seller' : 'customer';
const key=process.env.woo_commerce_client_key;
const secret=process.env.woo_commerce_client_secret;
    // 1. D'abord, créer l'utilisateur via l'API WordPress
    const wpResponse = await fetch(wpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si vous avez configuré JWT, vous aurez besoin d'un token admin ici
        // 'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name,
        last_name,
        roles: [woocommerceRole]
      }),
    });

    const userData = await wpResponse.json();

    if (!wpResponse.ok) {
      throw new Error(userData.message || 'Failed to register user');
    }

    // 2. Si c'est un vendeur, enregistrer les métadonnées supplémentaires
    if (role === 'vendor') {
      // Option 1: Utiliser l'API WooCommerce pour les vendeurs
      const wcVendorData = {
        first_name,
        last_name,
        username,
        email,
        meta_data: [
          { key: 'shop_name', value: shop_name },
          { key: 'phone', value: phone },
          { key: 'vendor_status', value: 'pending' }
        ]
      };

      const wcResponse = await fetch(`${apiBaseUrl}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Vous aurez besoin des clés API WooCommerce ici
             Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'),
        },
        body: JSON.stringify(wcVendorData)
      });

      if (!wcResponse.ok) {
        throw new Error('Failed to register vendor details');
      }

      // Option 2: Utiliser l'API WordPress standard pour les métadonnées
      /*
      await fetch(`${wpApiUrl}/${userData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          meta: {
            shop_name,
            phone,
            vendor_status: 'pending'
          }
        }),
      });
      */
    }

    // 3. Si tout s'est bien passé, connecter l'utilisateur directement
    // (optionnel) - obtenir un token JWT pour l'utilisateur
    const jwtResponse = await fetch(`${apiBaseUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const jwtData = await jwtResponse.json();

    if (!jwtResponse.ok) {
      // L'inscription a réussi mais la connexion automatique a échoué
      return res.status(200).json({ 
        success: true, 
        message: 'User registered successfully. Please log in.',
        userId: userData.id
      });
    }

    // Réponse avec le token JWT
    res.status(200).json({ 
      success: true, 
      message: 'User registered and logged in successfully',
      token: jwtData.token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: woocommerceRole,
        firstName: first_name,
        lastName: last_name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      details: error.response?.data || null
    });
  }
}