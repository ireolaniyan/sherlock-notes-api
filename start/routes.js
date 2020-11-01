'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.group(() => {
  Route.post('/signup', 'AuthController.signup').validator('User');
  Route.post('/login', 'AuthController.login');

  Route.post('/add-book', 'BookController.addBook').middleware(['auth:jwt']);
  Route.patch('/update-book/:id', 'BookController.updateUserBook').middleware(['auth:jwt']);
  Route.get('/my-books', 'BookController.getUserBooks').middleware(['auth:jwt']);

  Route.post('/add-log', 'ReadingLogController.addReadingLog').middleware(['auth:jwt']);
  Route.get('/next-pages/:book_id', 'ReadingLogController.getNextPages').middleware(['auth:jwt']);
}).prefix('/v1')