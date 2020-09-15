'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserBookSchema extends Schema {
  up() {
    this.create('user_books', (table) => {
      table.increments()
      table.integer('user_id')
      table.string('book_title')
      table.string('book_author')
      table.integer('book_rating').defaultTo(0)
      table.integer('number_of_pages')
      table.integer('daily_reading_goal').defaultTo(5)
      table.integer('expected_days_for_completion').defaultTo(0)
      table.integer('actual_days_of_completion').defaultTo(0)
      table.timestamps()
    })
  }

  down() {
    this.drop('user_books')
  }
}

module.exports = UserBookSchema
