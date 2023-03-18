import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from './Images/MetaMask_Fox.png';
import { authenticateAction } from './comps/authenticate';

function Account() {
    const navigate = useNavigate();
    const [isAuthenticated, setAuthenticated] = useState();
    const [account, setAccount] = useState([]);
    const [listings, setListings] = useState([]);

    // check if user is logged into a metamask account, otherwise forward them to login page
    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => {
                if (accounts.length > 0) {
                    setAuthenticated(true);
                    setAccount(accounts[0]);
                    console.log(accounts[0]);
                }
                else {
                    navigate('/bad-login');
                }
            });
    }, []);

    // returns all nfts for the logged in account
    useEffect(() => {
        if (isAuthenticated) {
            axios.get("/api/nft/listings", 
                {
                    params: {
                        available: true,
                        publicAddress: account,
                    },
                })
                .then((res) => {
                    console.log(res.data);
                    var data = res.data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].imageUrl === undefined || data[i].imageUrl === null) {
                            data[i].imageUrl = logo;
                        }
                    }
                    setListings(data);
                });
        }

    }, [isAuthenticated]);

    async function edit() {
        const [ publicAddress, signature ] = await authenticateAction(navigate);
        
        axios.put('/api/nft/listing', { 
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
        });
      }

    async function remove(id) {
        
        var answer = window.confirm ("Would you like to delete this listing?");
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
                console.log(res.data)
                alert ('Your listing has been deleted.')
              });
        }        
      }

    return (
        /* table format
        <div>
            <h2>List of Your NFTs</h2>
            <table className="table">
                <tbody>
                    {
                    listings.map((list, index) =>
                        <tr key={index} style={{ width: '20%' }}>
                            <td style={{ width: '30%' }}> NFT {index + 1}</td>
                            <td key="name" style={{ width: '30%' }} >{list.name}</td>
                            <td style={{ width: '30%' }}>
                                <img className='browseImage' src={list.imageUrl} />
                                {console.log(list._id)}
                            </td>
                            <td style={{ width: '30%' }}>
                                <button id={"button" + index} onClick={() => navigate('/nft?id=' + list._id)}> Rent </button>
                            </td>
                        </tr>
                        )
                    }
                </tbody>
            </table>
        </div>*/

        /*Eustace's format*/
        <div>
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