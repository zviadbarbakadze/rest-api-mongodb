const express = require("express");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwtSecret = "secret-key";

const User = require("../models/user");

const UsersService = require("../services/UserService.js");
const TasksService = require("../services/TaskService.js");
const AuthService = require("../services/AuthService.js");

const router = express.Router();
const jwtExtractor = passportJWT.ExtractJwt;
const jwtOptions = {
  jwtFromRequest: jwtExtractor.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

const usersService = new UsersService();
const tasksService = new TasksService();
const authService = new AuthService(jwtSecret);

passport.use(
  new passportJWT.Strategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id).populate("tasks");
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.log(error.message);
      return done(error, false);
    }
  })
);

router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const newUser = await usersService.registerUser({
      firstname,
      lastname,
      email,
      password,
    });

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await authService.loginUser(email, password);

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { title, description } = req.body;
    const user = req.user;

    if (!user) {
      return res
        .status(500)
        .json({ message: "User data missing or corrupted" });
    }

    try {
      const newTask = await tasksService.addTask(user, { title, description });

      res
        .status(201)
        .json({ message: "Task added successfully", task: newTask });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Failed to add task" });
    }
  }
);

router.delete(
  "/tasks/:taskId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const user = req.user;

      const deletedTask = await tasksService.deleteTask(user, taskId);

      res
        .status(200)
        .json({ message: "Task deleted successfully", task: deletedTask });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

router.patch(
  "/tasks/:taskId/done",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const user = req.user;

      const task = await tasksService.markTaskAsDone(user, taskId);

      res.json({ message: "Task marked as done", task });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

router.put(
  "/tasks/:taskId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { title, description } = req.body;
      const user = req.user;

      const updatedTask = await tasksService.updateTask(user, taskId, {
        title,
        description,
      });

      res
        .status(200)
        .json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user;

    console.log("User:", user);

    if (!user || user.tasks.length === 0) {
      console.log("No tasks found for the user");
      return res.status(404).json({ message: "No tasks found for the user" });
    }

    const todoTasks = await tasksService.getAllTasks(user, false);

    if (todoTasks.length === 0) {
      console.log("No tasks found for the user");
      return res.status(404).json({ message: "No tasks found for the user" });
    }

    res
      .status(200)
      .json({ message: "Tasks retrieved successfully", tasks: todoTasks });
  }
);

router.get(
  "/tasks/completed-tasks",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      const completedTasks = await tasksService.getCompletedTasks(user);

      if (completedTasks.length === 0) {
        return res
          .status(404)
          .json({ message: "No completed tasks found for the user" });
      }

      res.json({
        message: "Completed tasks retrieved successfully",
        tasks: completedTasks,
      });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
