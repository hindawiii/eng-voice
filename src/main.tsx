import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { migrateStorage } from "./lib/migrateStorage";

migrateStorage();

createRoot(document.getElementById("root")!).render(<App />);
