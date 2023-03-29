import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Web3 from 'web3';

import logo from './assets/MetaMask_Fox.png';
import { authenticateAction } from './comps/authenticate'
import Nav from "./Nav";

function Nft() {
    const navigate = useNavigate();
    const web3 = new Web3(Web3.givenProvider);

    const [listing, setListing] = useState(0);
    const [period, setPeriod] = useState(0);
    const [authenticated,setAuthenticated] = useState(false);
    const [searchParams]=useSearchParams();

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
        try {
            const current_chainId = await window.ethereum.chainId;
            if(current_chainId !== '0x13881') {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x13881' }]
                });
            }
            const escrowAddress = (await axios.get("/api/smart_contract/escrow/address", {
                params: {
                    contractAddress: listing.contractAddress,
                    tokenId: listing.tokenID
                }
            })).data;
            //MATIC has this amount in USD
            const amount = web3.utils.toWei((listing.rentalRate * period).toString(), 'ether');
            const transactionReceipt = await web3.eth.sendTransaction({
                to: escrowAddress, 
                from: window.ethereum.selectedAddress, 
                value: amount});

            const [publicAddress, signature] = await authenticateAction(navigate);
            const response = await axios.post("/api/nft/rent", {
                listingID: listing._id,
                daysRentedFor: period,
                transactionHash: transactionReceipt.transactionHash
            }, {
                params: {
                    signature: signature,
                    publicAddress: publicAddress
                }
            });

            if(response.status === 200)
            {
                alert('Now processing rental.');
                navigate('/');
            }
        } catch (e) {
            console.log(e)
        }
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