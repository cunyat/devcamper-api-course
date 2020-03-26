const Bootcamp = require("../models/Bootcamp");

/**
 * @description   Get all bootcamps
 * @route         GET /api/v1/bootcamps
 * @access        Public
 */
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch {
    res.status(400).json({ success: false });
  }
};

/**
 * @description   Get single bootcamp
 * @route         GET /api/v1/bootcamp/:id
 * @access        Public
 */
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) return res.status(400).json({ success: false });

    res.status(200).json({ success: true, data: bootcamp });
  } catch {
    res.status(400).json({ success: false });
  }
};

/**
 * @description   Create new bootcamp
 * @route         POST /api/v1/bootcamp
 * @access        Private
 */
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch {
    res.status(400).json({ success: false });
  }
};

/**
 * @description   Update bootcamp
 * @route         PUT /api/v1/bootcamp/:id
 * @access        Private
 */
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!bootcamp) return res.status(400).json({ success: false });

    res.status(200).json({ success: true, data: bootcamp });
  } catch {
    res.status(400).json({ success: false });
  }
};

/**
 * @description   Delete bootcamp
 * @route         DELETE /api/v1/bootcamp/:id
 * @access        Private
 */
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) return res.status(400).json({ success: false });

    res.status(200).json({ success: true, data: {} });
  } catch {
    res.status(400).json({ success: false });
  }
};
