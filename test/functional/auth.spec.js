'use strict'

const { test, trait } = use('Test/Suite')('Auth')

trait('Test/ApiClient')

test('should create a user', async ({ assert, client }) => {
  const data = {
    username: "profrey",
    email: "ire@gmail.com",
    password: "abcdef"
  }

  const response = await client.post('/v1/signup').send(data).end();

  response.assertStatus(201);
  assert.equal('Success', response.body.message);
})