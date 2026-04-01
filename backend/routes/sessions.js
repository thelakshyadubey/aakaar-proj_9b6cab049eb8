const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Session, User, ExcelFile } = require('../database/models');

const validateSession = [
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer')
    .custom(async (value) => {
      const user = await User.findByPk(value);
      if (!user) {
        throw new Error('User does not exist');
      }
    }),
  body('excelFileId')
    .isInt()
    .withMessage('Excel file ID must be an integer')
    .custom(async (value) => {
      const excelFile = await ExcelFile.findByPk(value);
      if (!excelFile) {
        throw new Error('Excel file does not exist');
      }
    }),
];

// Get all sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: ExcelFile, attributes: ['id', 'fileName', 's3Key'] },
      ],
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sessions', error: error.message });
  }
});

// Get session by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: ExcelFile, attributes: ['id', 'fileName', 's3Key'] },
      ],
    });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving session', error: error.message });
  }
});

// Create new session
router.post(
  '/',
  authMiddleware,
  validateSession,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { userId, excelFileId } = req.body;
      const session = await Session.create({ userId, excelFileId });
      const createdSession = await Session.findByPk(session.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: ExcelFile, attributes: ['id', 'fileName', 's3Key'] },
        ],
      });
      res.status(201).json(createdSession);
    } catch (error) {
      res.status(500).json({ message: 'Error creating session', error: error.message });
    }
  }
);

// Update session
router.put(
  '/:id',
  authMiddleware,
  validateSession,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { userId, excelFileId } = req.body;
      const session = await Session.findByPk(req.params.id);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      session.userId = userId;
      session.excelFileId = excelFileId;
      await session.save();
      const updatedSession = await Session.findByPk(session.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: ExcelFile, attributes: ['id', 'fileName', 's3Key'] },
        ],
      });
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: 'Error updating session', error: error.message });
    }
  }
);

// Delete session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    await session.destroy();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
});

module.exports = router;