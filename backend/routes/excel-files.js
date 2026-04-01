const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { ExcelFile, User } = require('../database/models');

const validateExcelFile = [
  body('fileName').trim().notEmpty().withMessage('File name is required'),
  body('s3Key').trim().notEmpty().withMessage('S3 key is required'),
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer')
    .custom(async (value) => {
      const user = await User.findByPk(value);
      if (!user) {
        throw new Error('User does not exist');
      }
    }),
];

// Get all Excel files
router.get('/', authMiddleware, async (req, res) => {
  try {
    const files = await ExcelFile.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Excel file by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const file = await ExcelFile.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
    if (!file) {
      return res.status(404).json({ message: 'Excel file not found' });
    }
    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Excel file metadata
router.post(
  '/',
  authMiddleware,
  validateExcelFile,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileName, s3Key, userId } = req.body;

    try {
      const file = await ExcelFile.create({
        fileName,
        s3Key,
        userId,
      });

      res.status(201).json({
        message: 'Excel file metadata created',
        file,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update Excel file metadata
router.put(
  '/:id',
  authMiddleware,
  validateExcelFile,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileName, s3Key, userId } = req.body;
    const updateData = {};
    if (fileName !== undefined) updateData.fileName = fileName;
    if (s3Key !== undefined) updateData.s3Key = s3Key;
    if (userId !== undefined) updateData.userId = userId;

    try {
      const file = await ExcelFile.findByPk(req.params.id);
      if (!file) {
        return res.status(404).json({ message: 'Excel file not found' });
      }

      await file.update(updateData);
      res.json({
        message: 'Excel file updated',
        file,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete Excel file
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const file = await ExcelFile.findByPk(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'Excel file not found' });
    }

    await file.destroy();
    res.json({ message: 'Excel file deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;