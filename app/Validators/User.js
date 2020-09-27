'use strict'

class User {
  get rules() {
    return {
      // validation rules
      email: 'required|email|unique:users,email',
      password: 'required|min:6',
      username: 'required|string|unique:users,username'
    }
  }

  get sanitizationRules() {
    // sanitize data before validation
    return {
      email: 'trim',
      password: 'trim'
    }
  }

  get messages() {
    return {
      'email.required': 'Email is required',
      'email.email': 'Email is invalid',
      'email.unique': 'An account with this email exists',
      'password.unique': 'Password is required',
      'password.min': 'Password too short. Expected a minimum of 6 characters',
      'username.required': 'Username is required',
      'username.unique': 'Username already exists'
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(400).json({
      success: false,
      message: errorMessages[0].message
    })
  }
}

module.exports = User
