import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { FocusView } from "./pages/FocusView";
import { BrainDumpView } from "./pages/BrainDumpView";
import { BacklogView } from "./pages/BacklogView";

export const router = createBrowserRouter([
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
