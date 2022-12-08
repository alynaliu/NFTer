import React, { Component } from "react";
import Browse from "./Browse"
import ConnectWallet from "./ConnectWallet"
import Login from "./Login";
import CreateNFT from "./CreateNFT";
import EditNFT from "./EditNFT";
import Nft  from "./Nft";
import Account from "./Account"

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
          <Route path="/createnft" element={<CreateNFT/>}/>
          <Route path="/editnft" element={<EditNFT/>}/>
          <Route path="/nft" element={<Nft/>}/>
          <Route path="/account" element={<Account/>}/>
        </Routes>
      </Router>
    );
}

export default App;
