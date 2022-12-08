import { useState} from 'react'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"

function CreateNFTListing() {
    const navigate = useNavigate();

    const [listing, setListing] = useState(0);
    const [data, setData] = useState([])
    const [nft, setNFT] = useState([])
    const [contractAddress, setContractAddress] = useState('0x622d8fea4603ba9edaf1084b407052d8b0a9bed7');
    const [rentalRate, setRentalRate] = useState(0);
    const [rentalDays, setRentalDays] = useState(0);
    const [activatedNFT, setActivatedNFT] = useState('');
    const [tokenId, setTokenId] = useState('')

    async function getNFT(e) {
        const [publicAddress, signature] = await authenticateAction(navigate);
        const response = await axios.get("/api/account/nfts", {
            params:{        
                publicAddress: publicAddress,
                chain: 'polygon',
                contract: contractAddress,
                signature: signature
            }
        })
        console.log(response.data);
        setNFT([...response.data]);
    }

    function selectNFT(index){
        console.log(nft[index].name)
        console.log(nft[index].tokenId)
        setActivatedNFT(nft[index].name)
        setTokenId(nft[index].tokenId)
    }

    async function createNFT() {
        const [publicAddress, signature] = await authenticateAction(navigate)
        if (rentalDays > 30) {
            alert("Rental Days should be less or equal to 30 days")
        }
        else {
            const response = await axios.post("/api/nft/listing", {
                blockchain: 'polygon',
                tokenID: tokenId,
                contractAddress: contractAddress,
                rentalRate: rentalRate,
                maxRentalPeriod: rentalDays
            }, {
                params: {
                    signature: signature,
                    publicAddress: publicAddress
                }
            })
            console.log(response.data);
            setData(response.data);
        }

    }

    return (
        <div>
            <div>
            <label>
                    Enter Contract Address
                    <input type="text" onChange={(e) => setContractAddress(e.target.value)} />
            </label>
            <button onClick={(e) => getNFT(e)}> Get NFTs</button>
            <div className='NFT'>
            {
                nft.map((datas, index) =>
                    <div key={datas.tokenID + "-" + index} onClick={(e) => selectNFT(index)}>
                        <p>Choose an NFT to create an NFT Post:</p>
                        <img src={datas.imageUrl}/>
                        <p>{datas.name}</p>
                        <p>{datas.tokenId}</p>

            <div >
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
                )
            }
           
            
            </div>
            </div>
        </div>
    );
}

export default CreateNFTListing;
