'use strict'

const User = use('App/Models/User');

class AuthController {
  async signup({ auth, request, response }) {
    try {
      const userData = request.all();
      const user = await User.create(userData);
      const token = await auth.attempt(user.email, userData.password);

      return response.status(201).send({
        success: true,
        message: "Success",
        data: user, token
      });
    } catch (error) {
      console.log("Signup Error ", error);
      return response.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async login({ auth, request, response }) {
    try {
      const { username, password } = request.all();
      let token;

      if (username.includes('@')) {
        token = await auth.attempt(username, password);
      } else {
        token = await auth.authenticator('jwtUsername').attempt(username, password);
      }

      return response.status(200).send({
        success: true,
        message: 'Success',
        data: token
      })
    } catch (error) {
      console.log("Login Error ", error);
      return response.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = AuthController
