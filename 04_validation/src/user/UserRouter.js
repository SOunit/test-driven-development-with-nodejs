const express = require('express');
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');

const router = express.Router();

// replace with express-validator
// const validateUserName = (req, res, next) => {
//   const user = req.body;
//   if (user.username === null) {
//     req.validationErrors = {
//       username: 'Username cannot be null',
//     };
//   }
//   next();
// };
// const validateEmail = (req, res, next) => {
//   const user = req.body;
//   if (user.email === null) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: 'E-mail cannot be null',
//     };
//   }
//   next();
// };

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('Username cannot be null')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('Must have min 4 and max 32 characters'),
  check('email').notEmpty().withMessage('E-mail cannot be null').bail().isEmail().withMessage('E-mail is not valid'),
  check('password')
    .notEmpty()
    .withMessage('Password cannot be null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        return (validationErrors[error.param] = error.msg);
      });
      // const response = { validationErrors: { ...req.validationErrors } };
      return res.status(400).send({ validationErrors });
    }

    await UserService.save(req.body);
    return res.send({ message: 'User created' });
  }
);

module.exports = router;
