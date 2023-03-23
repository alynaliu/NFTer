import React, { Component } from "react";
import Browse from "./Browse";
import ConnectWallet from "./ConnectWallet";
import CreateNFT from "./CreateNFT";
import EditNFT from "./EditNFT";
import Nft  from "./Nft";
import Account from "./Account";
import NFTRentalHistory from "./NFTRentalHistory";


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
          <Route path="/login" element={<ConnectWallet/>}/>
          <Route path="/createnft" element={<CreateNFT/>}/>
          <Route path="/editnft" element={<EditNFT/>}/>
          <Route path="/nft" element={<Nft/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/nftrentalhistory" element={<NFTRentalHistory/>}/>
        </Routes>
      </Router>
    );
}

export default App;
