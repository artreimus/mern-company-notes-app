const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getSingleUser,
} = require('../controllers/userControllers');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRole = require('../middleware/verifyRole');
//
router.use(verifyJWT);

router.route('/').get(getAllUsers);

router.use(verifyRole);
router.post('/', createUser);
router.route('/:id').get(getSingleUser).patch(updateUser).delete(deleteUser);

module.exports = router;
