const app = require('./src/app');
const { sequelize } = require('./src/user/User');

sequelize.sync();

app.listen(5000, () => {
  console.log('app is running!');
});
