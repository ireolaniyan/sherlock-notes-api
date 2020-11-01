'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReadingLogSchema extends Schema {
  up() {
    this.create('reading_logs', (table) => {
      table.increments()
      table.integer('user_id')
      table.integer('book_id')
      table.integer('start_page').nullable()
      table.integer('stop_page').nullable()
      table.string('reading_notes').defaultTo('')
      table.integer('next_start_page')
      table.integer('next_stop_page')
      table.boolean('daily_target_met').defaultTo(0)
      table.date('log_date')
      table.timestamps()
    })
  }

  down() {
    this.drop('reading_logs')
  }
}

module.exports = ReadingLogSchema
