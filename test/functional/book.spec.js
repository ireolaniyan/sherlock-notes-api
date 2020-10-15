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

test('should fail to update a book', async ({ assert, client }) => {
  const response = await client
    .patch('/v1/update-book/10')
    .header('Authorization', `Bearer ${authToken}`)
    .send({ book_title: 'The Art of Deception', book_author: 'Kevin Mitnick', daily_reading_goal: 10 })
    .end();

  response.assertStatus(400);
  assert.equal(false, response.body.success);
  assert.equal('User book not found', response.body.message);
})

test('should update a book', async ({ assert, client }) => {
  const response = await client
    .patch(`/v1/update-book/${bookData.id}`)
    .header('Authorization', `Bearer ${authToken}`)
    .send({ book_title: 'The Art of Deception', book_author: 'Kevin Mitnick', daily_reading_goal: 10 })
    .end();

  response.assertStatus(200);
  assert.equal(true, response.body.success);
  assert.isObject(response.body.data);
})
