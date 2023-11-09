const bcrypt = require("bcrypt");
const User = require("../models/user");

class UsersService {
  async registerUser({ firstname, lastname, email, password }) {
    try {
      const userExists = await User.exists({ email });
      if (userExists) {
        throw new Error("Email already exists");
      }

      if (!firstname || !lastname || !email || !password) {
        throw new Error("All fields are required");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new User({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        tasks: [],
      });

      await newUser.save();
      return newUser;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

module.exports = UsersService;
