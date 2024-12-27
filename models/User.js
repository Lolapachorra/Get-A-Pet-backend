const mongoose = require("../db/conn.js");

const { Schema } = require("mongoose");

const User = mongoose.model(
  "User",
  new Schema(
    {
      name: { type: "string", required: true },
      email: { type: "string", required: true, unique: true },
      password: { type: "string", required: true },
      image: { type: "string" },
      phone: { type: "string", required: true },
      //is adimin
      isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

module.exports = User;
