'use strict'

const { test, trait } = use('Test/Suite')('Auth');

trait('Test/ApiClient');

test('should create a user', async ({ assert, client }) => {
  const data = {
    username: "profrey",
    email: "ire@gmail.com",
    password: "abcdef"
  }

  const response = await client.post('/v1/signup').send(data).end();

  response.assertStatus(201);
  assert.equal('Success', response.body.message);
});

test('should fail to login a user', async ({ assert, client }) => {
  const data = {
    username: 'ire@gmail.com',
    password: 'abcdefg'
  }

  const response = await client.post('/v1/login').send(data).end();

  response.assertStatus(500);
  assert.equal(false, response.body.success);
  assert.equal('Email and Password Mismatch', response.body.message);
})

test('should login a user', async ({ assert, client }) => {
  const data = {
    username: 'ire@gmail.com',
    password: 'abcdef'
  }

  const response = await client.post('/v1/login').send(data).end();

  response.assertStatus(200);
  assert.equal('Success', response.body.message);
})