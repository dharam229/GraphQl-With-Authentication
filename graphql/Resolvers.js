const bcrypt = require("bcryptjs");
const User   = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;
const resolvers = {
  getUser: async ({ id }) => {
    try {
      const user = await User.findById(id);
      return user;
    } catch (err) {
      throw new Error("Error retrieving user");
    }
  },
  getUsers: async () => {
    try {
      const users = await User.find();
      return users;
    } catch (err) {
      throw new Error("Error retrieving users");
    }
  },
  createUser: async ({ name, email, password }) => {
    try {
	  var new_password = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: new_password });
      await user.save();
      return user;
    } catch (err) {
      throw new Error("Error creating user");
    }
  },
  updateUser: async ({ id, name, email, password }) => {
    try {
		var new_password = await bcrypt.hash(password, 10);
      const user = await User.findByIdAndUpdate(
        id,
        { name, email, password: new_password },
        { new: true }
      );
      return user;
    } catch (err) {
      throw new Error("Error updating user");
    }
  },
  deleteUser: async ({ id }) => {
    try {
      const user = await User.findByIdAndRemove(id);
      return user;
    } catch (err) {
      throw new Error("Error deleting user");
    }
  },
};

module.exports = resolvers;