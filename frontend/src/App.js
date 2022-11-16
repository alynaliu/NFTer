import React, { Component } from "react";
import Browse from "./Browse"
import ConnectWallet from "./ConnectWallet"

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

function App (){
  return (
    <Router>
        <Routes>
          <Route path="/Browse" element={<Browse/>}/>
          <Route path="/ConnectWallet" element={<ConnectWallet/>}/>
        </Routes>
      </Router>
    );
}

export default App;
