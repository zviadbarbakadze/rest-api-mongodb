const Task = require("../models/task.js");

class TasksService {
  findTaskById(user, taskId) {
    return user.tasks.find((task) => task.id === taskId);
  }
  async addTask(user, { title, description }) {
    if (!title || !description) {
      throw new Error("All fields are required");
    }

    const newTask = new Task({
      title,
      description,
      done: false,
    });
    await newTask.save();
    user.tasks.push(newTask);
    await user.save();
    return newTask;
  }

  async deleteTask(user, taskId) {
    const taskIndex = user.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    const deletedTask = user.tasks.splice(taskIndex, 1)[0];
    await user.save();
    return deletedTask;
  }

  async markTaskAsDone(user, taskId) {
    const task = await this.findTaskById(user, taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    task.done = true;
    await user.save();
    return task;
  }

  async updateTask(user, taskId, { title, description }) {
    const task = await this.findTaskById(user, taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    task.title = title;
    task.description = description;
    await user.save();
    return task;
  }

  async getAllTasks(user, completed = false) {
    return user.tasks.filter((task) => task.done === completed);
  }

  async getCompletedTasks(user) {
    return user.tasks.filter((task) => task.done === true);
  }
}

module.exports = TasksService;
