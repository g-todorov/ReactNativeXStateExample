import React from "react";
import { PaperProvider } from "react-native-paper";

import { AppProvider } from "./src/contexts/useApp";
import { Navigation } from "./src/navigation/Navigation";

function App(): JSX.Element {
  return (
    <PaperProvider>
      <AppProvider>
        <Navigation />
      </AppProvider>
    </PaperProvider>
  );
}

export default App;
