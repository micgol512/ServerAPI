// routes

//GET
// /static/ ->  index.html
// /cars -> cars from db/cars.json
// /cars/:id -> specyfic data for id
// /users -> users from db/users.json
// /users/id ->specyfic data for id

//POST
function homeHandler(req, res) {
  res.end("<h1>Strona główna</h1>");
}
function carsHandler(req, res) {
  res.end("<h1>Samochody</h1>");
}
function usersHandler(req, res) {
  res.end("<h1>Użytkownicy</h1>");
}
function hackHandler(req, res) {
  res.end("<h1>Hack</h1>");
}
function notFoundHandler(req, res) {
  res.end("<h1>404 - Not Found</h1>");
}
function errorHandler(req, res) {
  res.end("<h1>500 - Server Error</h1>");
}
