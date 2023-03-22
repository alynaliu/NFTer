import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import logo from './assets/MetaMask_Fox.png';
import './styles/style.css';

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
   
    }

    return (
      <div>
        <div className='nftdisplay'>
            <div className='imageSide'>
                <img src={listing.imageUrl}/>
            </div>
            <div className='infoSide'>
                <p>Lender: {listing.ownerPublicAddress}</p>
                <p className='subtle'>Collection</p>
                <p className='nftName'>{listing.name}</p>
                <p className='subtle'>{listing.tokenID+" | "+listing.contractType+" | "+listing.contractAddress}</p>
                <p>{listing.description}</p>
                <input placeholder='Rent Duration (30 days Max)' onChange={handleChange}></input>
                <div>
                    <p className='alignleft'>Daily price</p>
                    <p className='alignright'>{listing.rentalRate + ' ETH'}</p>
                </div>
                <hr className='clear'></hr>
                <div >
                    <p className='alignleft'>Total amount</p>
                    <p className='alignright'>{(listing.rentalRate * period) + ' ETH'}</p>
                </div>
                <div className='clear'></div>
                {
                    authenticated ?
                        period > 0 ?
                        <button onClick={() => rent()} className='clear available' > Rent Now!</button>
                        :
                        <button className='clear unavailable' > Rent Now!</button>
                    :
                    <button className='clear' onClick={() => connect()}> Connect to wallet to rent</button>
                }
            </div>
        </div>
      </div>
    );
  }
  
  export default Nft;