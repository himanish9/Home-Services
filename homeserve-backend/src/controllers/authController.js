const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/token');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Register a new customer or service provider
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'CUSTOMER',
      experience_years,
      service_area,
      bio,
      category_ids
    } = req.body;

    // 1. Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    // 2. Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. User active status
    const userStatus = 'ACTIVE';

    // 4. Create user in database
    const newUserId = await userModel.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: role.toUpperCase(),
      status: userStatus
    });

    let workerProfile = null;

    // 5. If registering as a SERVICE_PROVIDER, create worker profile & link skills
    if (role.toUpperCase() === 'SERVICE_PROVIDER') {
      const workerProfileId = await userModel.createWorkerProfile({
        userId: newUserId,
        experienceYears: experience_years ? parseInt(experience_years, 10) : 1,
        serviceArea: service_area ? service_area.trim() : 'Local City Area',
        bio: bio ? bio.trim() : '',
        isApproved: false // Requires admin approval
      });

      if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        await userModel.addWorkerSkills(workerProfileId, category_ids);
      }

      workerProfile = {
        id: workerProfileId,
        is_approved: false
      };
    }

    // 6. Fetch created user without password
    const user = await userModel.findById(newUserId);

    // 7. Generate JWT token
    const token = generateToken(user);

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        workerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user and return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Fetch user by email (including password hash)
    const user = await userModel.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // 2. Compare entered password with stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // 3. Verify user account is not suspended
    if (user.status === 'SUSPENDED') {
      return sendError(res, 403, 'Your account has been suspended. Please contact support.');
    }

    // 4. Fetch worker profile if user is a service provider
    let workerProfile = null;
    if (user.role === 'SERVICE_PROVIDER') {
      workerProfile = await userModel.getWorkerProfileByUserId(user.id);
    }

    // 5. Generate JWT token
    const token = generateToken(user);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        workerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT)
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let workerProfile = null;

    if (user.role === 'SERVICE_PROVIDER') {
      workerProfile = await userModel.getWorkerProfileByUserId(user.id);
    }

    return sendSuccess(res, 200, 'User profile retrieved', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        workerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
