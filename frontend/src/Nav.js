import React from "react";
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';

function Navbar() {

    const [authenticated,setAuthenticated] = useState(false);
    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
            if(accounts.length > 0)
                setAuthenticated(true);
        });

        window.ethereum.on('accountsChanged', (accounts) => {
            const authStatus = accounts.length > 0;
            setAuthenticated(authStatus);
        });
    }, []);

  if (authenticated){  
        return (
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <Link className="logo" to="/">NFTer</Link>

                    <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbar" className="navbar-menu">
                    <div className="navbar-end">
                        <Link className="navbar-item" to="/CreateNft">Create Listing</Link>
                        {/* Add links here */}
                        <Link className="navbar-item" to="/account">My Listings</Link>
                        <Link className="navbar-item" to="/">Rental History</Link>
                    </div>
                </div>
            </nav>
        );
    }
    else {
        return (
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <Link className="logo" to="/">NFTer</Link>

                    <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbar" className="navbar-menu">
                    <div className="navbar-end">
                        <Link className="navbar-item" to="/login">Connect Wallet</Link>
                    </div>
                </div>
            </nav>
        );
    }
    }
export default Navbar;

{/* <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <Link to="/">NFTer</Link>

                    <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbar" className="navbar-menu">
                    <div className="navbar-start">
                        <a className="navbar-item">
                            Home
                        </a>

                        <a className="navbar-item">
                            Documentation
                        </a> 
                    </div>

                    <div class="navbar-end">
                        <div class="navbar-item">
                            <div class="buttons">
                            <a class="button is-primary">
                                <strong>Sign up</strong>
                            </a>
                            <a class="button is-light">
                                Log in
                            </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav> */}