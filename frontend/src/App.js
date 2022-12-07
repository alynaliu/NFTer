import React, { Component } from "react";
import Browse from "./Browse"
import ConnectWallet from "./ConnectWallet"
import Login from "./Login";
import Nft  from "./Nft";

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
          <Route path="/login" element={<Login/>}/>
          <Route path="/nft" element={<Nft/>}/>
        </Routes>
      </Router>
    );
}

export default App;
