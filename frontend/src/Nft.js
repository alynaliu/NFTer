import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import logo from './assets/MetaMask_Fox.png';
import Nav from "./Nav";

function Nft() {
    const [listing, setListing] = useState(0);
    const [period, setPeriod] = useState(0);
    const [authenticated,setAuthenticated] = useState(false);
    const [searchParams]=useSearchParams();
    const transactionParameters = {
        to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      };

    const handleChange = event => {
        let result =event.target.value.replace(/\D/g, '');
        if(result> 30){
            result = 30;
        }
        event.target.value = result;
        setPeriod(result);
      };

    useEffect(() => {
        const query = searchParams.get('id')
        axios.get('/api/nft/listing',{params:{id: query}})
        .then(res => {
            if(res.data.imageUrl === undefined || res.data.imageUrl === ''){
                res.data.imageUrl = logo;
            }
            setListing(res.data);
        })
    }, []);

    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
            .then((accounts) => {
                if(accounts.length > 0) {
                    setAuthenticated(true);
                }
            })
    }, []);

    async function connect() {
        await window.ethereum.request({ method: 'eth_requestAccounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
            .then((accounts) => {
                setAuthenticated(true);
            })
            .catch((error) => {
                if (error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    console.log('Please connect to MetaMask.');
                } else {
                    console.error(error);
                }
            });
    }

    async function rent(){
        //RENTAL CODE GOES HERE
    }

    return (
      <div>
        <Nav />
        <div className="hero is-fullheight-with-navbar">
            <div className="hero-body">
                <div className="container">
                    <div className="nft_view">
                        <img src={listing.imageUrl} />
                        <div className="has-text-justified">
                            <p className="title">NFT Details</p>
                            <p><strong>Lender:</strong> <a href={`https://testnets.opensea.io/${listing.ownerPublicAddress}`} target="_blank">{listing.ownerPublicAddress}</a></p>
                            <p><strong>NFT Name:</strong> {listing.name}</p>
                            <p><strong>Token ID:</strong> {listing.tokenID}</p>
                            <p><strong>Token Type:</strong> {listing.tokenType}</p>
                            <p><strong>Contract Address:</strong> {listing.contractAddress}</p>
                            <br />
                            <p>{listing.description}</p>

                            <hr className='clear'></hr>
                            <p><strong>Daily Price:</strong> {`${listing.rentalRate} MATIC`}</p>
                            <div className="is-flex is-align-items-center my-3">
                                <label className="label my-0 mr-3">Rental Duration in Days (30 Days Max):</label>
                                <div className="field">
                                    <div className="control">
                                        <input className="input" type="text" name="rentalDays" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                            <p><strong>Total Rental Cost:</strong> {`${listing.rentalRate * period} MATIC`}</p>
                            {
                                authenticated ?
                                <button className="button mt-4 is-info" onClick={() => rent()}>Rent Now!</button> :
                                <button className="button mt-4 is-info" onClick={() => connect()}>Connect to wallet to rent</button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
}
  
export default Nft;