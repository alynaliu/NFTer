import React, { Component } from "react";
import Browse from "./Browse"
import ConnectWallet from "./ConnectWallet"
import Login from "./Login";
<<<<<<< Updated upstream
import Nft  from "./Nft";
=======
import Account from "./Account"
>>>>>>> Stashed changes

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
          <Route path="/" element={<Browse/>}/>
          <Route path="/ConnectWallet" element={<ConnectWallet/>}/>
          <Route path="/login" element={<Login/>}/>
<<<<<<< Updated upstream
          <Route path="/nft" element={<Nft/>}/>
=======
          <Route path="/account" element={<Account/>}/>
>>>>>>> Stashed changes
        </Routes>
      </Router>
    );
}

export default App;
