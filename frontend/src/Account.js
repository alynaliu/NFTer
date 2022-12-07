import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authenticateAction } from './comps/authenticate';

function Account() {
    const navigate = useNavigate();
    const [isAuthenticated, setAuthenticated] = useState();
    const [account, setAccount] = useState();

    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => {
                if (accounts.length > 0) {
                    setAuthenticated(true);
                    //navigate("/")
                }
            });
    }, []);

    // returns all nfts listed by an account
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
        /*
        axios.post('/api/nft/listing', {
            blockchain: 'polygon',
            contractAddress: '0x622d8fea4603ba9edaf1084b407052d8b0a9bed7',
            tokenID: '1000633',
            publicAddress: '0x96a16f15Ea9204b3742156af19649DBfdAFd7B16'
        }, {
            params: {
                publicAddress: publicAddress,
                signature: signature
            }
        })
            .then((res) => {
                console.log(res.data)
            });*/
        
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
        const [publicAddress, signature] = await authenticateAction(navigate);
    }

    return (
        <div>
            <button onClick={() => submit()}>Log in with Metamask</button>
        </div>
    );
}

export default Account;