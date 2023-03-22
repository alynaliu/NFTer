import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { authenticateAction } from './comps/authenticate'
import logo from './assets/MetaMask_Fox.png';
import './styles/style.css';
import Web3 from 'web3'

import ERC721 from './assets/ERC721.json'

function Nft() {
    const web3 = new Web3(Web3.givenProvider);
    const navigate = useNavigate();
    const [listing, setListing] = useState(0);
    const [period, setPeriod] = useState(0);
    const [authenticated,setAuthenticated] = useState(false);
    const [searchParams]=useSearchParams();
    const [senderAddress, setSenderAddress] = useState('');
    const [tokenId, setTokenId] = useState('')
   

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
                else{
                    setSenderAddress(accounts[0]);
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
        console.log(listing);
        console.log(listing.contractAddress);
        const contract = new web3.eth.Contract(ERC721.abi, listing.contractAddress);
        console.log("1")
        const transactionParameters = {
            nonce: '0x00',
            to: listing.contractAddress,
            from: window.ethereum.selectedAddress,
            data: contract.methods.safeTransferFrom(senderAddress, '0xDeD80eA0c8a18F5274eeef5b27F2f56e6cd26Bf6', tokenId).encodeABI(),
            chainId: '0x3',
            networkId: process.env.REACT_APP_NETWORK_ID
        };
        console.log("2")
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        console.log("3")


        const [ publicAddress, signature ] = await authenticateAction(navigate);
        const response = await axios.post('/api/nft/rent',{
            tokenID: tokenId,
            dayRentedFor: period,
            transactionHash: txHash
        }, {
            params: {
                signature: signature,
                publicAddress: publicAddress
            }
        })
        console.log("4")

        if(response.status === 200)
        {
            alert ('Your nft has been rented.');
        }
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