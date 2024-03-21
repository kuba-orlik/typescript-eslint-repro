import * as Turbo from "@hotwired/turbo";
import { Application } from "stimulus";
import InputImagePreview from "./controllers/input-image-preview";
import TaskController from "./controllers/task-controller";

export { Turbo };

const application = Application.start();
application.register("task", TaskController);
application.register("input-image-preview", InputImagePreview);
