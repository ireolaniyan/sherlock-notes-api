'use strict'

const User = use('App/Models/User');

class AuthController {
  async signup({ request, response }) {
    try {
      const userData = request.all();
      const user = await User.create(userData);

      return response.status(201).send({
        success: true,
        message: "Success",
        data: user
      })

    } catch (error) {
      console.log("Signup Error ", error);
      return response.status(500).send({
        success: false,
        message: "Internal Server Error",
      })
    }
  }
}

module.exports = AuthController
