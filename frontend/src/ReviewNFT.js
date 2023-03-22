import './styles/style.css';
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"
import axios from "axios";

function ReviewNFT(){

    const [nft, setNFT] = useState({});
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [NFTReview, setNFTReview] = useState();

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

    async function review(){
        const [publicAddress, signature] = await authenticateAction(navigate);
        const response = await axios.put("/api/nft/listing", {
            listingID: nft._id, 
            nftReview: NFTReview
        
            }, {
                params:
                {        
                publicAddress: publicAddress,
                signature: signature
                }
        })
    
    }


    return (
        <div>
            <img src={nft.imageUrl}/>
            <p>NFT Name: {nft.name}</p>
            <br></br>
            <div>

            <p>Please review the selected NFT: {nft.name}</p>
                <br></br>
                <label>
                    Update Review
                    <input type="text" name="NFTReview" onChange={(e) => setNFTReview(e.target.value)} />
                </label>
        
            <br></br>
            <button onClick={() => review()}> Add Review</button>

            </div>
        </div>
    )






}
export default ReviewNFT;