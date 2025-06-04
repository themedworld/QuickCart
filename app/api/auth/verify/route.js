import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_clé_secrète');
    return res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}
