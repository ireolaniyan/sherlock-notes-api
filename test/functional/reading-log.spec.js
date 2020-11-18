'use strict'

const superagent = require("superagent");
const { test, trait, before } = use('Test/Suite')('Reading Log')
trait('Test/ApiClient');

const User = use('App/Models/User');
const UserBook = use('App/Models/UserBook');

const mockData = require('../../mockData');
const userData = mockData.user;
const bookData = mockData.bookData;
const readingLogData = mockData.readingLog;

let authToken;

before(async () => {
  const res = await superagent
    .post('http://127.0.0.1:4000/v1/login')
    .send({ username: userData.username, password: userData.password });

  authToken = res.body.data.token;

  const user = await User.findBy('username', userData.username);
  const book = await UserBook.findBy('user_id', user.id);

  userData.id = user.id;
  bookData.id = book.id;
})

test('should add reading log for the day', async ({ assert, client }) => {
  readingLogData.book_id = bookData.id;

  const response = await client
    .post('/v1/add-log')
    .header('Authorization', `Bearer ${authToken}`)
    .send(readingLogData)
    .end();

  response.assertStatus(201);
  assert.equal(true, response.body.success);
  assert.isObject(response.body.data);
})

test('should add reading log for unspecified start and stop page for the day', async ({ assert, client }) => {
  const data = {
    book_id: bookData.id,
    log_date: '2020-10-31'
  }

  const response = await client
    .post('/v1/add-log')
    .header('Authorization', `Bearer ${authToken}`)
    .send(data)
    .end();

  response.assertStatus(201);
  assert.equal(true, response.body.success);
  assert.isObject(response.body.data);
})

test('should update reading log', async ({ assert, client }) => {
  const response = await client
    .put('/v1/update-log/1/1')
    .header('Authorization', `Bearer ${authToken}`)
    .send({ stop_page: 10 })
    .end();

  response.assertStatus(200);
  assert.equal(true, response.body.success);
  assert.isObject(response.body.data);
  assert.equal(10, response.body.data.stop_page);
})

test('should get next start and stop page', async ({ assert, client }) => {
  const response = await client
    .get('/v1/next-pages/1')
    .header('Authorization', `Bearer ${authToken}`)
    .end();

  response.assertStatus(200);
})