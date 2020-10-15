'use strict'

const UserBook = use('App/Models/UserBook');

const { StatusCodes } = use('http-status-codes');
const { successResponse, errorResponse } = use('App/HelperFunctions/ResponseBuilder');

const DAILY_READING_GOAL = 5;

class BookController {
  async addBook({ auth, request, response }) {
    const { book_title, book_author, number_of_pages, daily_reading_goal } = request.post();
    const daysToCompleteBook = Math.ceil(number_of_pages / (daily_reading_goal || DAILY_READING_GOAL));

    try {
      const { id: userId } = await auth.getUser();

      const userBook = new UserBook();
      userBook.user_id = userId;
      userBook.book_title = book_title;
      userBook.book_author = book_author;
      userBook.number_of_pages = number_of_pages;
      userBook.daily_reading_goal = daily_reading_goal;
      userBook.expected_days_for_completion = daysToCompleteBook;
      await userBook.save();

      const data = await UserBook.find(userBook.id);
      return successResponse(response, { data }, StatusCodes.CREATED);
    } catch (error) {
      console.log("Add Book Error ", error);
      return errorResponse(response, error);
    }
  }
}

module.exports = BookController
