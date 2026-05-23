import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'لا يوجد توكن' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صحيح' });
  }
};

export const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'لا يوجد توكن' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'moderator') {
      return res.status(403).json({ message: 'لا يملك صلاحيات' });
    }

    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    req.adminEmail = decoded.email;
    req.adminCanCreate = decoded.canCreateAdmins;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صحيح' });
  }
};
