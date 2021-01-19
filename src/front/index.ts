import * as Turbo from "@hotwired/turbo";
import { Application } from "stimulus";
import TaskController from "./controllers/task_controller";

export { Turbo };

const application = Application.start();
application.register("task", TaskController);
