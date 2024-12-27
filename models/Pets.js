const mongoose = require("../db/conn.js");

const { Schema } = require("mongoose");

const Pets = mongoose.model(
  "Pets",
  new Schema(
    {
      name: {type: String, required: true},
      age: {type: String, required: true},
      weight: {type: Number, required: true},
      color: {type: String, required: true},
      images: {type: Array, required: true},
      available: {type: Boolean},
      user: Object,
      adopter: Object,
    },
    { timestamps: true }
  )
);

module.exports = Pets;
