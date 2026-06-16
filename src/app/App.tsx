import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { PinLock, isUnlocked } from "./components/PinLock";

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked);

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  return <RouterProvider router={router} />;
}
