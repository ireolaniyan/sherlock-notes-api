'use strict'

const ReadingLog = use('App/Models/ReadingLog');
const UserBook = use('App/Models/UserBook');

const moment = require('moment');
const { StatusCodes } = use('http-status-codes');
const { successResponse, errorResponse } = use('App/HelperFunctions/ResponseBuilder');

class ReadingLogController {
  async addReadingLog({ auth, request, response }) {
    const { book_id, start_page, stop_page, reading_notes, log_date } = request.post();

    let nextStartPage;
    let nextStopPage;
    let numberOfPagesRead;

    try {
      const { id: userId } = await auth.getUser();

      const userBook = await UserBook.query()
        .where('id', book_id)
        .andWhere('user_id', userId)
        .first();

      if (!userBook) {
        return errorResponse(response, { message: "User book not found" }, StatusCodes.BAD_REQUEST);
      }

      if (start_page && stop_page) {
        nextStartPage = stop_page + 1;
        nextStopPage = nextStartPage + userBook.daily_reading_goal - 1;
        numberOfPagesRead = (stop_page - start_page) + 1;
      } else {
        const lastUserReadingLog = await ReadingLog.query()
          .where('user_id', userId)
          .andWhere('book_id', book_id)
          .last();

        if (!lastUserReadingLog) {
          nextStartPage = 1;
          nextStopPage = userBook.daily_reading_goal;
        } else {
          nextStartPage = lastUserReadingLog.next_start_page;
          nextStopPage = lastUserReadingLog.next_stop_page;
        }
      }

      const readingLog = new ReadingLog();
      readingLog.user_id = userId;
      readingLog.book_id = book_id;
      readingLog.start_page = start_page;
      readingLog.stop_page = stop_page;
      readingLog.reading_notes = reading_notes;
      readingLog.next_start_page = nextStartPage;
      readingLog.next_stop_page = nextStopPage;
      readingLog.daily_target_met = (numberOfPagesRead >= userBook.daily_reading_goal) ? true : false;
      readingLog.log_date = moment(log_date).format('YYYY-MM-DD');
      await readingLog.save();

      const data = await ReadingLog.find(readingLog.id);
      return successResponse(response, { data }, StatusCodes.CREATED);
    } catch (error) {
      console.log("Add ReadingLog Error ", error);
      return errorResponse(response, error);
    }
  }

  async getNextPages({ params: { book_id }, auth, request, response }) {
    let startPage;
    let stopPage;

    try {
      const { id: userId } = await auth.getUser();

      const userBook = await UserBook.query()
        .where('id', book_id)
        .andWhere('user_id', userId)
        .first();

      if (!userBook) {
        return errorResponse(response, { message: "User book not found" }, StatusCodes.BAD_REQUEST);
      }

      const lastReadingLog = await ReadingLog.query()
        .where('user_id', userId)
        .andWhere('book_id', book_id)
        .last();

      if (!lastReadingLog) {
        startPage = 1;
        stopPage = userBook.daily_reading_goal
      } else {
        startPage = lastReadingLog.next_start_page;
        stopPage = lastReadingLog.next_stop_page;
      }

      const data = {
        start_page: startPage,
        stop_page: stopPage
      }

      return successResponse(response, { data }, StatusCodes.OK);
    } catch (error) {
      console.log("Get Next Pages Error ", error);
      return errorResponse(response, error);
    }
  }
}

module.exports = ReadingLogController
