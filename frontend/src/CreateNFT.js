import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Web3 from 'web3'

import ERC721 from './assets/ERC721.json'
import { authenticateAction } from './comps/authenticate'

function CreateNFTListing() {
    const navigate = useNavigate();
    const web3 = new Web3(Web3.givenProvider);

    const [nft, setNFT] = useState([])
    const [senderAddress, setSenderAddress] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [rentalRate, setRentalRate] = useState(0);
    const [rentalDays, setRentalDays] = useState(0);
    const [activatedNFT, setActivatedNFT] = useState('');
    const [tokenId, setTokenId] = useState('')

    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
        .then((accounts) => {
            if(accounts.length === 0) {
                navigate('/ConnectWallet');
            }
            else {
                setSenderAddress(accounts[0]);
            }
        })
        .catch((error) =>{
            console.error(error);
            navigate('/ConnectWallet');
        });
    }, []);

    async function getNFT() {
        const [publicAddress, signature] = await authenticateAction(navigate);
        const response = await axios.get("/api/account/nfts", {
            params:{        
                publicAddress: publicAddress,
                contract: contractAddress,
                signature: signature
            }
        })
        setNFT([...response.data]);
    }

    function selectNFT(index){
        setActivatedNFT(nft[index].metadata.title);
        setTokenId(parseInt(nft[index].id.tokenId));
    }

    async function createNFT() {
        if (rentalDays > 30)
            return alert("Rental Days should be less or equal to 30 days");
        
        const contract = new web3.eth.Contract(ERC721.abi, contractAddress);

        const transactionParameters = {
            nonce: '0x00',
            to: contractAddress,
            from: window.ethereum.selectedAddress,
            data: contract.methods.safeTransferFrom(senderAddress, '0xDeD80eA0c8a18F5274eeef5b27F2f56e6cd26Bf6', tokenId).encodeABI(),
            chainId: '0x3',
            networkId: process.env.REACT_APP_NETWORK_ID
        };
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        
        const [publicAddress, signature] = await authenticateAction(navigate)
        const response = await axios.post("/api/nft/listing", {
            tokenID: tokenId,
            contractAddress: contractAddress,
            rentalRate: rentalRate,
            maxRentalPeriod: rentalDays,
            transactionHash: txHash
        }, {
            params: {
                signature: signature,
                publicAddress: publicAddress
            }
        })
        
        if(response.status === 200)
        {
            navigate('/');
        }
    }

    return (
        <div>
            <div>
                <label>
                        Enter Contract Address
                        <input type="text" onChange={(e) => setContractAddress(e.target.value)} />
                </label>
                <button onClick={() => getNFT()}> Get NFTs</button>
                <div className='NFT'>
                    {
                        nft.map((datas, index) =>
                            <div key={datas.tokenID + "-" + index} onClick={(e) => selectNFT(index)}>
                                <p>Choose an NFT to create an NFT Post:</p>
                                <img src={datas.media[0].gateway}/>
                                <p>{datas.metadata.title}</p>
                                <p>{parseInt(datas.id.tokenId)}</p>
                            </div>
                        )
                    }
                    <br></br>
                    <p>Please add the rental rate and rental days for the selected NFT: {activatedNFT}</p>
                    <br></br>
                    <label>
                        Add Rental Rate
                        <input type="text" name="rentalRate" onChange={(e) => setRentalRate(e.target.value)} />
                    </label>
                    <br></br>
                    <label>
                        Add Max Rental Days
                        <input type="text" name="rentaDays" onChange={(e) => setRentalDays(e.target.value)} />
                    </label>
                    <button onClick={() => createNFT()}> Create NFT List</button>
                </div>
            </div>
        </div>
    );
}

export default CreateNFTListing;
