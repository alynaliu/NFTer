import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"
import NoImage from './assets/NoImage.png';
import Nav from "./Nav";

function NFTRentalHistory(){
    const [listings, setListings] = useState({
      pendingRentals: [], 
      activeRentals: [],
      archivedRentals: []
    });
    const navigate = useNavigate();
  
    // fetch the rentals
    useEffect(() => {
      const run = async() =>{
        const [publicAddress, signature] = await authenticateAction(navigate);
        console.log(publicAddress);
        axios.get("/api/nft/rent", {
          params: {
            publicAddress: publicAddress.toLowerCase(),
            signature: signature
          },
        })
        .then((res) => {
          setListings(res.data);
        });
      }
 
       run();
    }, []);

    const displayRentals = (rentals) => {
      return (
          rentals.map((rental) =>
              <div className="box">
                <p><strong>Listing ID:</strong> <Link to={`/nft?id=${rental.listingID}`} target="_blank" >{rental.listingID}</Link></p>
                <p><strong>Rented From:</strong> {rental.rentedFrom}</p>
                <p><strong>Rented Until:</strong> {rental.rentedUntil}</p>
                <p><strong>Days:</strong> {rental.days}</p>
                <p><strong>Transaction Hash:</strong> <a href={`https://mumbai.polygonscan.com/tx/${rental.transactionHash}`} target="_blank" >{rental.transactionHash}</a></p>
                <p><strong>Price:</strong> {rental.price}</p>
              </div>
          )
      );
    }

    return (
      <div>
        <Nav />
        <div className="hero is-fullheight-with-navbar">
          <div className="hero-body is-align-items-flex-start">
            <div className="container has-text-centered">
              <p className="title">Your Pending NFT Rentals</p>
              {
                listings.pendingRentals.length > 0 ?
                displayRentals(listings.pendingRentals)
                :
                <p>No pending NFT rentals found.</p>
              }
              <hr className='clear'></hr>
              <p className="title">Your Active NFT Rentals</p>
              {
                listings.activeRentals.length > 0 ?
                displayRentals(listings.activeRentals)
                :
                <p>No current NFT rentals found.</p>
              }
              <hr className='clear'></hr>
              <p className="title">Your Archived NFT Rentals</p>
              {
                listings.archivedRentals.length > 0 ?
                displayRentals(listings.archivedRentals)
                :
                <p>No archived NFT rentals found.</p>
              }
            </div>
          </div>
        </div>
      </div> 
    );

}

export default NFTRentalHistory;