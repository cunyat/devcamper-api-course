const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const geocoder = require("../utils/geocoder");

/**
 * @description   Get all bootcamps
 * @route         GET /api/v1/bootcamps
 * @access        Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  let queryStr, query;

  // fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // lover over remove fields and remove from reqQuery
  removeFields.forEach(field => delete reqQuery[field]);

  // Format query operators
  queryStr = JSON.stringify(reqQuery).replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`
  );

  // execute query
  query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortby = req.query.sort.split(",").join(" ");
    query = query.sort(sortby);
  } else {
    query = query.sort("-createdAt");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // wait for results
  const bootcamps = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination: pagination,
    data: bootcamps
  });
});

/**
 * @description   Get single bootcamp
 * @route         GET /api/v1/bootcamp/:id
 * @access        Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );

  res.status(200).json({ success: true, data: bootcamp });
});

/**
 * @description   Create new bootcamp
 * @route         POST /api/v1/bootcamp
 * @access        Private
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

/**
 * @description   Update bootcamp
 * @route         PUT /api/v1/bootcamp/:id
 * @access        Private
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );

  res.status(200).json({ success: true, data: bootcamp });
});

/**
 * @description   Delete bootcamp
 * @route         DELETE /api/v1/bootcamp/:id
 * @access        Private
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

/**
 * @description   Get bootcamps within a radius
 * @route         GET /api/v1/bootcamp/radius/:zipcode/:distance
 * @access        Private
 */
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/long from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth (3,963 mi / 6,378 km)
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res
    .status(200)
    .json({ succes: true, count: bootcamps.length, data: bootcamps });
});
