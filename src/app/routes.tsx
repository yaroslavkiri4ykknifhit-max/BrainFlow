import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { FocusView } from "./pages/FocusView";
import { BrainDumpView } from "./pages/BrainDumpView";
import { BacklogView } from "./pages/BacklogView";
import { StatsView } from "./pages/StatsView";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: FocusView },
      { path: "dump", Component: BrainDumpView },
      { path: "backlog", Component: BacklogView },
      { path: "stats", Component: StatsView },
    ],
  },
]);
