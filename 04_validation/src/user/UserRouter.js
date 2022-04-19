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
  check('username').notEmpty().withMessage('Username cannot be null'),
  check('email').notEmpty().withMessage('E-mail cannot be null'),
  check('password').notEmpty().withMessage('Password cannot be null'),
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