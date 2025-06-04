export async function verifyToken(token) {
  if (!token) return false

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(
      `${apiBaseUrl}/wp-json/jwt-auth/v1/token/validate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    return response.ok
  } catch (error) {
    return false
  }
}

export async function fetchUserData(token) {
  const response = await fetch(
    `${apiBaseUrl}/wp-json/wc/v3/customers/current`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  )

  if (!response.ok) throw new Error('Failed to fetch user data')

  const user = await response.json()
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: 'customer'
  }
}