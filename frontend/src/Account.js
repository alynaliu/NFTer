import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authenticateAction } from './comps/authenticate';

function Account() {
    const navigate = useNavigate();
    const [isAuthenticated, setAuthenticated] = useState();
    const [account, setAccount] = useState();

    // check if user is logged into a metamask account, otherwise forward them to login page
    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => {
                if (accounts.length > 0) {
                    setAuthenticated(true);
                    setAccount(accounts[0]);
                }
                else {
                    navigate("/login")
                }
            });
    }, []);

    // returns all nfts listed by an account, to be checked later
    useEffect(() => {
        if (isAuthenticated && account !== undefined) {
            axios
                .get("/api/nft/listings", {
                    params: {
                        available: true,
                        publicAddress: account,
                    },
                })
                .then((res) => {
                    console.log(res.data);
                });
        }

    }, [account]);

    async function submit() {
        
        // if there is more than 1 account linked, then the user is authorized 
        await window.ethereum.request({ method: 'eth_requestAccounts' })
            .then((accounts) => {
                if (accounts.length > 0) {
                    setAuthenticated(true);
                    setAccount(accounts[0]);
                    console.log(account);
                    //navigate("/")
                }
            })
            .catch((error) => {
                if (error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    console.log('Please connect to MetaMask.');
                    setAuthenticated(false);
                } else {
                    console.error(error);
                }
            });
        //const [publicAddress, signature] = await authenticateAction(navigate);
    }

    return (
        <div>
            <button onClick={() => submit()}>Log in with Metamask</button>
        </div>
    );
}

export default Account;