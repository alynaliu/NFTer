import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate";
import Nav from "./Nav";

function EditNFTListings() {
    const navigate = useNavigate();
    const [listing, setListing] = useState({});
    const [searchParams] = useSearchParams();
    const [rentalRate, setRentalRate] = useState();
    const [rentalPeriod, setRentalPeriod] = useState();

    useEffect(() => {
        const query = searchParams.get("id");
        axios.get("/api/nft/listing", {
            params: { id: query }
        })
        .then((res) => {
            setListing(res.data);
            setRentalRate(res.data.rentalRate);
            setRentalPeriod(res.data.maxRentalPeriod);
        });
    }, []);

    async function editNFT() {
        const [publicAddress, signature] = await authenticateAction(navigate);
        const response = await axios.put(
        "/api/nft/listing",
        {
            listingID: listing._id,
            rentalRate: rentalRate,
            maxRentalPeriod: rentalPeriod,
        },
        {
            params: {
            publicAddress: publicAddress,
            signature: signature,
            },
        }
        );
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
                                <div className="is-flex is-align-items-center my-3">
                                    <label className="label my-0 mr-3">Rental Rate (In MATIC):</label>
                                    <div className="field">
                                        <div className="control">
                                            <input className="input" type="text" name="rentalRate" defaultValue={rentalRate} onChange={(e) => setRentalRate(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="is-flex is-align-items-center my-3">
                                    <label className="label my-0 mr-3">Max Rental Time (In Days):</label>
                                    <div className="field">
                                        <div className="control">
                                            <input className="input" type="text" name="rentalDays" defaultValue={rentalPeriod} onChange={(e) => setRentalPeriod(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <button className="button is-info my-3" onClick={() => editNFT()}>Edit NFT Listing</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditNFTListings;
