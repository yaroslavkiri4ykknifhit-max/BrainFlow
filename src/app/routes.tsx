import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { FocusView } from "./pages/FocusView";
import { BrainDumpView } from "./pages/BrainDumpView";
import { BacklogView } from "./pages/BacklogView";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: FocusView },
      { path: "dump", Component: BrainDumpView },
      { path: "backlog", Component: BacklogView },
    ],
  },
]);
