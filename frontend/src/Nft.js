import './styles/style.css';
import logo from './Images/MetaMask_Fox.png';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Nft() {
    const [listing, setListing] = useState(0);
    const [period, setPeriod] = useState(0);
    const [authenticated,setAuthenticated] = useState(false);

    useEffect(() => {
        axios.get('/api/nft/listing',{params:{id: '639023bd07619c7fe48cbb8d'}})
        .then(res => {

            if(res.data.imageUrl === undefined){
                console.log("Meow")
                res.data.imageUrl = logo;
            }
            setListing(res.data);
        })
    }, []);

    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => {
                if(accounts.length > 0) {
                    setAuthenticated(true);
                }
            })
    }, []);

    async function submit() {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
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
                <p className='subtle'>{listing.tokenID+" "+listing.contractType+" "+listing.contractAddress}</p>
                <p>{listing.description}</p>
                <input placeholder='Rent Duration' onChange={(e)=>setPeriod(e.target.value)}></input>
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
                    <button className='clear' > Rent Now!</button>
                    :
                    <button className='clear' onClick={() => submit()}> Connect to wallet to rent</button>
                }
            </div>
        </div>
      </div>
    );
  }
  
  export default Nft;