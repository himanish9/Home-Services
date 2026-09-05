const serviceModel = require('../models/serviceModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all service categories (supports search and active filter)
 * @route   GET /api/services
 * @access  Public
 */
const getServices = async (req, res, next) => {
  try {
    const { search, active } = req.query;
    const activeOnly = active === 'true';

    const services = await serviceModel.getAllServices({ search, activeOnly });
    return sendSuccess(res, 200, 'Services retrieved successfully', {
      count: services.length,
      services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service category by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await serviceModel.getServiceById(id);

    if (!service) {
      return sendError(res, 404, 'Service category not found');
    }

    return sendSuccess(res, 200, 'Service details retrieved', { service });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new service category
 * @route   POST /api/services
 * @access  Private (Admin only)
 */
const createService = async (req, res, next) => {
  try {
    const { name, description, icon, base_price, is_active } = req.body;

    // Check duplicate name
    const existing = await serviceModel.getServiceByName(name);
    if (existing) {
      return sendError(res, 409, 'A service category with this name already exists');
    }

    const newId = await serviceModel.createService({
      name,
      description,
      icon,
      base_price: parseFloat(base_price),
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    const newService = await serviceModel.getServiceById(newId);
    return sendSuccess(res, 201, 'Service category created successfully', {
      service: newService
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a service category
 * @route   PUT /api/services/:id
 * @access  Private (Admin only)
 */
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await serviceModel.getServiceById(id);

    if (!existing) {
      return sendError(res, 404, 'Service category not found');
    }

    const { name, description, icon, base_price, is_active } = req.body;

    // If name is changing, check uniqueness
    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await serviceModel.getServiceByName(name);
      if (duplicate) {
        return sendError(res, 409, 'Another category already uses this name');
      }
    }

    await serviceModel.updateService(id, {
      name,
      description,
      icon,
      base_price: base_price !== undefined ? parseFloat(base_price) : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined
    });

    const updated = await serviceModel.getServiceById(id);
    return sendSuccess(res, 200, 'Service category updated successfully', {
      service: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a service category
 * @route   DELETE /api/services/:id
 * @access  Private (Admin only)
 */
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await serviceModel.getServiceById(id);

    if (!existing) {
      return sendError(res, 404, 'Service category not found');
    }

    try {
      await serviceModel.deleteService(id);
      return sendSuccess(res, 200, 'Service category deleted successfully');
    } catch (dbError) {
      // If foreign key constraint blocks deletion, deactivate instead
      if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
        await serviceModel.updateService(id, { is_active: false });
        return sendSuccess(
          res,
          200,
          'Service category has associated bookings or workers, so it was deactivated instead of deleted'
        );
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
