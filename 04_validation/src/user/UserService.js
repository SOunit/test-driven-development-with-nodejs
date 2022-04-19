const User = require('./User');
const bcrypt = require('bcrypt');

const save = async (body) => {
  const hash = await bcrypt.hash(body.password, 10);

  // 1st
  // const user = {
  //   username: req.body.username,
  //   email: req.body.email,
  //   password: hash,
  // };

  // 2nd
  // const user = Object.assign({}, req.body, { password: hash });

  // 3rd
  const user = { ...body, password: hash };
  await User.create(user);
};

module.exports = {
  save,
};
