const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser(validUser);
    expect(response.statusCode).toBe(200);
    // .expect(200, done);
  });

  it('returns success message when signup request is valid', (done) => {
    postUser().then((response) => {
      expect(response.body.message).toBe('User created');
      done();
    });
  });

  it('saves the user to database', (done) => {
    postUser().then(() => {
      // query user table
      User.findAll().then((userList) => {
        expect(userList.length).toBe(1);
        done();
      });
    });
  });

  it('saves the username and email to database', (done) => {
    postUser().then(() => {
      // query user table
      User.findAll().then((userList) => {
        const savedUser = userList[0];
        expect(savedUser.username).toBe('user1');
        expect(savedUser.email).toBe('user1@mail.com');
        done();
      });
    });
  });

  it('hashes the password in database', (done) => {
    postUser().then(() => {
      // query user table
      User.findAll().then((userList) => {
        const savedUser = userList[0];
        expect(savedUser.password).not.toBe('P4ssword');
        done();
      });
    });
  });

  it('returns 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.status).toBe(400);
  });

  it('returns validationErrors field in response body when validation errors occurs', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it('returns error for both username and email is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  // 1st approach
  // it('returns username cannot be null when username is null', async () => {
  //   const response = await postUser({
  //     username: null,
  //     email: 'user1@mail.com',
  //     password: 'P4ssword',
  //   });

  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe('Username cannot be null');
  // });

  // it('returns email cannot be null when email is null', async () => {
  //   const response = await postUser({
  //     username: 'user1',
  //     email: null,
  //     password: 'P4ssword',
  //   });

  //   const body = response.body;
  //   expect(body.validationErrors.email).toBe('E-mail cannot be null');
  // });

  // it('returns Password cannot be null message when password is null', async () => {
  //   const response = await postUser({
  //     username: 'user1',
  //     email: 'user1@mail.com',
  //     password: null,
  //   });

  //   const body = response.body;
  //   expect(body.validationErrors.password).toBe('Password cannot be null');
  // });

  // 2nd approach
  // it.each([
  //   ['username', 'Username cannot be null'],
  //   ['email', 'E-mail cannot be null'],
  //   ['password', 'Password cannot be null'],
  // ])('when %s field is null %s is received', async (field, expectedMessage) => {
  //   const user = { username: 'user1', email: 'user1@mai.com', password: 'password' };
  //   user[field] = null;
  //   const response = await postUser(user);
  //   const body = response.body;
  //   expect(body.validationErrors[field]).toBe(expectedMessage);
  // });

  // 3rd approach
  it.each`
    field         | value                | expectedMessage
    ${'username'} | ${null}              | ${'Username cannot be null'}
    ${'username'} | ${'usr'}             | ${'Must have min 4 and max 32 characters'}
    ${'username'} | ${'a'.repeat(33)}    | ${'Must have min 4 and max 32 characters'}
    ${'email'}    | ${null}              | ${'E-mail cannot be null'}
    ${'email'}    | ${'mail.com'}        | ${'E-mail is not valid'}
    ${'email'}    | ${'user.mail.com'}   | ${'E-mail is not valid'}
    ${'email'}    | ${'user@mail'}       | ${'E-mail is not valid'}
    ${'password'} | ${null}              | ${'Password cannot be null'}
    ${'password'} | ${`P4ssw`}           | ${'Password must be at least 6 characters'}
    ${'password'} | ${`all-lower-case`}  | ${'Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'}
    ${'password'} | ${`ALL-UPPER-CASE`}  | ${'Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'}
    ${'password'} | ${`1234567`}         | ${'Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'}
    ${'password'} | ${`lower-and-UPPER`} | ${'Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'}
    ${'password'} | ${`lower444`}        | ${'Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'}
    ${'password'} | ${`UPPER444`}        | ${'Password must have at least 1 uppercase letter and 1 lowercase letter and 1 number'}
  `('returns $expectedMessage when $field is $value', async ({ field, expectedMessage, value }) => {
    const user = { username: 'user1', email: 'user1@mai.com', password: 'password' };
    user[field] = value;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  // it('returns size validation error when username is less than 4 characters ', async () => {
  //   const user = { username: 'usr', email: 'user1@mai.com', password: 'password' };
  //   const response = await postUser(user);
  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe('Must have min 4 and max 32 characters');
  // });
});
