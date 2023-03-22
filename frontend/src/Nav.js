import React from "react";
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';

function Navbar() {

    const [authenticated,setAuthenticated] = useState(false);
    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => {
                if(accounts.length > 0) {
                    setAuthenticated(true);
                }
            })
    }, []);

  if (authenticated){  
        return (
            <nav className="navbar">
            <ul>
                <li>
                <Link to="/">Home</Link>
                </li>
                <li>
                <Link to="/CreateNft">Create Listing</Link>
                </li>
                <li>
                <Link to="/EditNft">Edit Listing</Link>
                </li>
            </ul>
            </nav>
        );
    }
    }
export default Navbar;