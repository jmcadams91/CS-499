const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens
const express = require("express"); // Express app
const router = express.Router(); // Router logic

const tripsController = require("../controllers/trips");
const authController = require("../controllers/authentication");

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
  // console.log('In Middleware');
  const authHeader = req.headers['authorization'];
  // console.log('Auth Header: ' + authHeader);
  if (authHeader == null) {
    console.log('Auth Header Required but NOT PRESENT!');
    return res.sendStatus(401);
  }

  let headers = authHeader.split(' ');
  if (headers.length < 1) {
    console.log('Not enough tokens in Auth Header: ' + headers.length);
    return res.sendStatus(501);
  }

  const token = authHeader.split(' ')[1];
  // console.log('Token: ' + token);
  if (token == null) {
    console.log('Null Bearer Token');
    return res.sendStatus(401);
  }

  // console.log(process.env.JWT_SECRET);
  // console.log(jwt.decode(token));
  const verified = jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
    if (err) {
      console.log('Token Validation Error:', err.message);
      return res.status(401).json({ message: 'Token validation failed' });
    }

    req.auth = verified; // Set the auth param to the decoded object
  });

  next(); // We need to continue or this will hang forever
}

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);

// define route for our trips endpoint
router
    .route("/trips")
    .get(tripsController.tripsList) 
    .post(authenticateJWT, tripsController.tripsAddTrip); 

// GET Method routes tripsFindByCode - requires parameter
// PUT Method routes tripsUpdateTrip - requires parameter
router
    .route("/trips/:tripCode")
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip)
    .delete(authenticateJWT, tripsController.tripsDeleteTrip);

module.exports = router; 