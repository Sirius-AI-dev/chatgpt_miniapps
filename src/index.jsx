import { createRoot } from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import App from "./app";

createRoot(document.getElementById("chatgpt-app-root")).render(<App />);

/*
// Use for routing inside the mini app
function RouterRoot() {
  return (
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  );
}

createRoot(document.getElementById("chatgpt-app-root")).render(
  <BrowserRouter>
    <RouterRoot />
  </BrowserRouter>
);
*/

export { App };
export default App;