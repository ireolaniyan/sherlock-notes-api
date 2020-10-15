'use strict'

const superagent = require("superagent");
const { test, trait, before } = use('Test/Suite')('Book');
trait('Test/ApiClient');

const User = use('App/Models/User');

const mockData = require('../../mockData');

const userData = mockData.user;
const bookData = mockData.bookData;

let authToken;

before(async () => {
  const res = await superagent
    .post('http://127.0.0.1:4000/v1/login')
    .send({ username: userData.username, password: userData.password });

  authToken = res.body.data.token;

  const user = await User.findBy('username', userData.username);
  userData.id = user.id;
})

test('should add a book', async ({ assert, client }) => {
  const response = await client
    .post('/v1/add-book')
    .header('Authorization', `Bearer ${authToken}`)
    .send(bookData)
    .end();

  response.assertStatus(201);

  bookData.id = response.body.data.id;
})
