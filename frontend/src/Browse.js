import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const NFT = (props) => (
  <tr>
    <td>{props.name}</td>
    <td>{props.description}</td>
    <td>{props.ownerPublicAddress}</td>
    <td>{props.available}</td>
    <td>{props.rentalRate}</td>
    <td>{props.maxRentalPeriod}</td>
  </tr>
 );

function Browse() {
 const [listings, setListings] = useState([]);
 
 // fetch the NFTs that are available for rental
 useEffect(() => {  
  axios.get('/api/nft/listings', {
    params: {
      available: true
    }
  })
  .then((res) => {
    console.log(res.data)
    setListings(...res.data);
  });
  
 }, []); 

  return (
    <div>
   <h2>NFT List</h2>
   <table className="table">
     <thead>
       <tr>
         <th key ='name'>Name</th>

         <th key ='description'>Description</th>

         <th key ='ownerPublicAddress'>Owner's Address</th>

         <th key ='available'>Available</th>

         <th key = 'rentalRate'>Rental Rate</th>

         <th key = 'maxRentalPeriod'>Max Rental Period</th>
       </tr>
     </thead>
     <tbody>
     {
      listings.map((list, index) => 
      <NFT key = {'NFT-'+index} list={list} />)}
     </tbody>
   </table>
 </div>
  );
}  
export default Browse;

