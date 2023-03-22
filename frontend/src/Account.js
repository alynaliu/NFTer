import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from './assets/MetaMask_Fox.png';
import Nav from "./Nav";
import { authenticateAction } from './comps/authenticate';

function Account() {
    const navigate = useNavigate();
    const [isAuthenticated, setAuthenticated] = useState();
    const [account, setAccount] = useState([]);
    const [listings, setListings] = useState([]);

    // check if user is logged into a metamask account, otherwise forward them to login page
    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
            .then((accounts) => {
                if (accounts.length > 0) {
                    setAuthenticated(true);
                    setAccount(accounts[0]);
                }
                else {
                    navigate('/login');
                }
            });
    }, []);

    // returns all nfts for the logged in account
    useEffect(() => {
        if (isAuthenticated && account !== undefined) {
            axios.get("/api/nft/listings", 
                {
                    params: {
                        available: true,
                        publicAddress: account,
                    },
                })
                .then((res) => {
                    let data = res.data;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].imageUrl === undefined || data[i].imageUrl === null) {
                            data[i].imageUrl = logo;
                        }
                    }
                    setListings(data);
                });
        }

    }, [isAuthenticated]);

    async function remove(id) {
        
        let answer = window.confirm ("Would you like to delete this listing?");
        if (answer) {
            const [ publicAddress, signature ] = await authenticateAction(navigate);
            axios.delete('/api/nft/listing',  {
                params: {
                  publicAddress: publicAddress,
                  listingID: id,
                  signature: signature,
                }
              })
              .then((res) => {
                alert ('Your listing has been deleted.')
              });
        }        
      }

    return (     
        <div>
            <Nav />
            {
            listings.map((list, index) =>
                <div className='nftdisplay'>
                    <div className='imageSide'>
                        <img src={list.imageUrl} />
                    </div>
                    <div className='infoSide'>
                        <p>Lender: {account}</p>
                        <p className='subtle'>Collection</p>
                        <p className='nftName'>{list.name}</p>
                        <hr className='clear'></hr>
                        <button id = {'edit' + index} onClick={() => navigate('/editnft?id=' + list._id)}> Edit </button>
                        <button id = {'delete' + index} onClick={() => remove(list._id)}> Delete </button>
                    </div>
                </div>
                )
            }
        </div>
    );
}

export default Account;
