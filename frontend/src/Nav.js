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

    async function addMATICNetwork() {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x13881',
                chainName: 'Matic Mumbai Testnet',
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
                blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            }]
        });
    }

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
                        <Link className="navbar-item" to="/nftrentalhistory">Rental History</Link>
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
                    <div className="navbar-end is-align-items-center">
                        <Link className="navbar-item" to="/login">Connect Wallet</Link>
                        <button className="button" onClick={() => addMATICNetwork()}>Add MATIC Network</button>
                    </div>
                </div>
            </nav>
        );
    }
    }
export default Navbar;