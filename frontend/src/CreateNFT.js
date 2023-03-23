import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Web3 from 'web3'

import ERC721 from './assets/ERC721.json'
import { authenticateAction } from './comps/authenticate'
import Nav from "./Nav";

function CreateNFTListing() {
    const navigate = useNavigate();
    const web3 = new Web3(Web3.givenProvider);

    const [nft, setNFT] = useState([])
    const [senderAddress, setSenderAddress] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [rentalRate, setRentalRate] = useState(0);
    const [rentalDays, setRentalDays] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
        .then((accounts) => {
            if(accounts.length === 0) {
                navigate('/login');
            }
            else {
                setSenderAddress(accounts[0]);
            }
        })
        .catch((error) =>{
            console.error(error);
            navigate('/login');
        });
    }, []);

    async function getNFT() {
        setSelectedIndex(null);
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

    async function createNFT() {
        if (rentalDays > 30)
            return alert("Rental Days should be less or equal to 30 days");
        
        const factoryAddress = (await axios.get("/api/smart_contract/address")).data;

        const contract = new web3.eth.Contract(ERC721.abi, contractAddress);

        const transactionParameters = {
            nonce: '0x00',
            to: contractAddress,
            from: window.ethereum.selectedAddress,
            data: contract.methods.safeTransferFrom(senderAddress, factoryAddress, nft[selectedIndex].id.tokenId).encodeABI(),
            chainId: '0x3',
            networkId: process.env.REACT_APP_NETWORK_ID
        };
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        
        const [publicAddress, signature] = await authenticateAction(navigate)
        const response = await axios.post("/api/nft/listing", {
            tokenID: nft[selectedIndex].id.tokenId,
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
            <Nav />
            <div className="hero is-fullheight-with-navbar">
                <div className="hero-body is-align-items-flex-start">
                    <div className="container is-flex is-flex-direction-column is-align-items-center has-text-centered">
                        <p className="title">Create new NFT Rental Listing</p>
                        <div className="is-flex is-align-items-center">
                            <label className="label my-0 mr-3">Contract Address:</label>
                            <div className="field has-addons">
                                <div className="control">
                                    <input className="input" type="text" onChange={(e) => setContractAddress(e.target.value)} placeholder="NFT Contract Address" />
                                </div>
                                <div className="control">
                                    <button className="button is-info" onClick={() => getNFT()}> Get NFTs</button>
                                </div>
                            </div>
                        </div>
                        <div className="box mt-5 max_heigh_60vh width100">
                            <p className="subtitle">Owned NFTs from contract address</p>
                            { 
                                contractAddress === '' ?
                                <p>Please enter a contract address above.</p> :
                                <div className="is-flex is-flex-wrap-wrap is-justify-content-center my-1">
                                    {
                                        nft.map((datas, index) =>
                                        <div className="card nft_card" key={datas.tokenID + "-" + index} onClick={() => setSelectedIndex(index)}>
                                            <div className="card-image">
                                                <figure className="image is-square">
                                                    <img className="has-ratio" src={datas.media[0].gateway} />
                                                </figure>
                                            </div>
                                            <div className="card-content has-text-centered">
                                                <p>{datas.metadata.name}</p>
                                                <p>Id: {parseInt(datas.id.tokenId)}</p>
                                            </div>
                                        </div>
                                        )
                                    }
                                </div>
                            }
                        </div>
                        <div className="width100">
                            {
                                selectedIndex === null ?
                                <span />
                                :
                                <div className="box width100 mt-5 is-flex is-flex-direction-column is-align-items-center has-text-centered">
                                    <p className="title mt-2">Selected NFT</p>
                                    <div className="card nft_card default_cursor">
                                        <div className="card-image">
                                            <figure className="image is-square">
                                                <img className="has-ratio" src={nft[selectedIndex].media[0].gateway} />
                                            </figure>
                                        </div>
                                        <div className="card-content has-text-centered">
                                            <p>{nft[selectedIndex].metadata.name}</p>
                                            <p>Id: {parseInt(nft[selectedIndex].id.tokenId)}</p>
                                        </div>
                                    </div>
                                    <div className="is-flex is-align-items-center my-3">
                                        <label className="label my-0 mr-3">Rental Rate (In MATIC):</label>
                                        <div className="field">
                                            <div className="control">
                                                <input className="input" type="text" name="rentalRate" onChange={(e) => setRentalRate(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="is-flex is-align-items-center my-3">
                                        <label className="label my-0 mr-3">Max Rental Time (In Days):</label>
                                        <div className="field">
                                            <div className="control">
                                                <input className="input" type="text" name="rentalDays" onChange={(e) => setRentalDays(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <button className="button is-info my-3" onClick={() => createNFT()}>Create NFT Listing</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateNFTListing;
