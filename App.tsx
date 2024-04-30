import React from "react";
import { AppProvider } from "./src/contexts/useApp";

import { Navigation } from "./src/navigation/Navigation";

function App(): JSX.Element {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}

export default App;
