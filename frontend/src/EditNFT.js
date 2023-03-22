import { useEffect, useState} from 'react'
import axios from 'axios';
import { useNavigate, useSearchParams } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"
import Nav from "./Nav";

function EditNFTListings() {

    const navigate = useNavigate();
    const [nft, setNFT] = useState({});
    const [searchParams] = useSearchParams();
    const [rentalRate, setRentalRate] = useState();
    const [rentalPeriod, setRentalPeriod] = useState();


    useEffect(() => {
        const query = searchParams.get('id')
        axios.get("/api/nft/listing", {
            params:{
               id: query 
            }
        }).then((res) => {
            setNFT(res.data)
        });
    }, []);


    async function editNFT(){
        const [publicAddress, signature] = await authenticateAction(navigate);
        const response = await axios.put("/api/nft/listing", {
            listingID: nft._id, 
            rentalRate: rentalRate, 
            maxRentalPeriod: rentalPeriod
        
            }, {
                params:
                {        
                publicAddress: publicAddress,
                signature: signature
                }
        })
    
    }


    return (
            <> <Nav /><div>
                <img src={nft.imageUrl}/>
                <p>NFT Name: {nft.name}</p>
                <p>NFT Rental Rate: {nft.rentalRate}</p>
                <p>NFT Max Rental Period: {nft.maxRentalPeriod}</p>
                <br></br>
                <div>

                <p>Please update the rental rate and rental days for the selected NFT: {nft.name}</p>
                    <br></br>
                    <label>
                        Update Rental Rate
                        <input type="text" name="rentalRate" onChange={(e) => setRentalRate(e.target.value)} />
                    </label>
            
                <br></br>
           
                <label>
                    Update Max Rental Days
                    <input type="text" name="rentaDays" onChange={(e) => setRentalPeriod(e.target.value)} />
                </label>
                <button onClick={() => editNFT()}> Edit NFT List</button>

                </div>
            </div>
            </>
        )
  }
  
  export default EditNFTListings;