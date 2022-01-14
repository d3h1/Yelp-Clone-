require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.json()); // Our middleware

// Get Restaurants : http://:localhost:4000/getRestaurants
app.get("/api/v1/restaurants", async (req, res) => {
  try {
    //const results = await db.query("select * from restaurants");
    const restaurantRatingsData = await db.query(" select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;")

    res.status(200).json({
      status: "success",
      results: restaurantRatingsData.rows.length,
      data: {
        restaurants: restaurantRatingsData.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// Get Restaurant : http://localhost:4000/api/v1/restaurants/1
app.get("/api/v1/restaurants/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    const restaurant = await db.query(" select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1;", [
      req.params.id,]);
    // select * from restaurants where id = req.params.id : our very own little cyber_security system

    const reviews = await db.query("select * from reviews where restaurant_id = $1", [
      req.params.id,]);

    res.status(200).json({
      status: "success",
      data: {
        restaurant: restaurant.rows[0],
        reviews: reviews.rows
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// Create Restaurant : http://localhost:4000/api/v1/restaurants
app.post("/api/v1/restaurants", async (req, res) => {
  console.log(req.body);

  try {
    const results = await db.query(
      "insert into restaurants (name, location, price_range) values ($1, $2, $3) returning *",
      [req.body.name, req.body.location, req.body.price_range]
    );
    console.log(results);

    res.status(201).json({
      status: "success",
      data: {
        restaurant: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// Update Restaurant : http://localhost:4000/api/v1/restaurants/1234
app.put("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query(
      "UPDATE restaurants SET name = $1, location = $2, price_range = $3 where id = $4 returning *",
      [req.body.name, req.body.location, req.body.price_range, req.params.id]
    );
    console.log(results);
    res.status(200).json({
      status: "success",
      data: {
        restaurant: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// Delete Restaurant : http://localhost:4000/api/v1/restaurants/1234
app.delete("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query("DELETE FROM restaurants where id = $1", [
      req.params.id,
    ]);
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
  }
});

// Adding a review to the review page 
app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
  try {
    const newReview= await db.query('INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4);',
      [req.params.id, req.body.name, req.body.review, req.body.rating])
    console.log(newReview)
    res.status(201).json({
      status: 'success',
      data: {
        review: newReview.rows[0]
      }
    })

  } catch (error)
  {
    console.log(err)  
  }
})

const port = process.env.PORT || 3001; // gets port from .env file
app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});
