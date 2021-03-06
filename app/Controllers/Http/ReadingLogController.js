'use strict'

const ReadingLog = use('App/Models/ReadingLog');
const UserBook = use('App/Models/UserBook');

const moment = require('moment');
const { StatusCodes } = use('http-status-codes');
const { successResponse, errorResponse } = use('App/HelperFunctions/ResponseBuilder');

class ReadingLogController {
  async addReadingLog({ params: { book_id }, auth, request, response }) {
    const { start_page, stop_page, reading_notes, log_date } = request.post();

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
        return errorResponse(response, { message: "User book not found" }, StatusCodes.NOT_FOUND);
      }

      if (userBook.actual_days_of_completion > 0) {
        return errorResponse(response, { message: "Book already completed" }, StatusCodes.BAD_REQUEST);
      }

      if (start_page && stop_page) {
        nextStartPage = (stop_page <= userBook.number_of_pages) ? stop_page + 1 : null;
        nextStopPage = (stop_page <= userBook.number_of_pages) ? nextStartPage + userBook.daily_reading_goal - 1 : null;
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

      if (stop_page >= userBook.number_of_pages) {
        userBook.actual_days_of_completion = await ReadingLog.query().where('user_id', userId).andWhere('book_id', book_id).getCount();
        await userBook.save();
      }

      const data = await ReadingLog.find(readingLog.id);
      return successResponse(response, { data }, StatusCodes.CREATED);
    } catch (error) {
      console.log("Add ReadingLog Error ", error);
      return errorResponse(response, error);
    }
  }

  async updateReadingLog({ params: { book_id, log_id }, auth, request, response }) {
    const { start_page, stop_page, reading_notes, log_date } = request.post();

    try {
      const { id: userId } = await auth.getUser();

      const readingLog = await ReadingLog.query()
        .where('id', log_id)
        .andWhere('user_id', userId)
        .andWhere('book_id', book_id)
        .first();

      if (!readingLog) {
        return errorResponse(response, { message: "Reading log not found" }, StatusCodes.BAD_REQUEST);
      }

      const userBook = await UserBook.query()
        .where('id', book_id)
        .andWhere('user_id', userId)
        .first();

      Object.entries({
        start_page, stop_page, reading_notes, log_date
      }).forEach(([key, val]) => {
        if (val !== undefined) readingLog[key] = val;
      });

      const nextStartPage = readingLog.stop_page + 1;
      const nextStopPage = nextStartPage + userBook.daily_reading_goal - 1;
      const numberOfPagesRead = (readingLog.stop_page - readingLog.start_page) + 1;

      readingLog.next_start_page = nextStartPage;
      readingLog.next_stop_page = nextStopPage;
      readingLog.daily_target_met = (numberOfPagesRead >= userBook.daily_reading_goal) ? true : false;
      await readingLog.save();

      return successResponse(response, { data: readingLog }, StatusCodes.OK);
    } catch (error) {
      console.log("Update ReadingLog Error ", error);
      return errorResponse(response, error);
    }
  }

  async getReadingLogs({ params: { book_id }, auth, request, response }) {
    try {
      const { id: userId } = await auth.getUser();

      const readingLogs = await ReadingLog.query()
        .where('user_id', userId)
        .andWhere('book_id', book_id)
        .fetch();

      return successResponse(response, { data: readingLogs }, StatusCodes.OK);

    } catch (error) {
      console.log("Get ReadingLogs Error ", error);
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
