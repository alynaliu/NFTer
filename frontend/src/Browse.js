import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from './assets/MetaMask_Fox.png';
import './styles/style.css';

function Browse() {
  const [listings, setListings] = useState([]);
  const [name, setName] = useState([]);
  const navigate = useNavigate();


  const onChangeHandler = event => {
    setName(event.target.value);
 };

  // fetch the NFTs that are available for rental
  useEffect(() => {
    axios
      .get("/api/nft/listings", {
        params: {
          available: true,
        },
      })
      .then((res) => {
        console.log (res.data);
        var data = res.data;
        var foundData = [];
        // display everything if search bar is blank, or filter results that user searched for only
        for (var i = 0; i < data.length; i++) {
          if(name === "" || data[i].name.toString().toLowerCase().includes(name.toString().toLowerCase()))
          {
            if (data[i].imageUrl === undefined || data[i].imageUrl === null) {
              data[i].imageUrl = logo;              
            }
            foundData.push(data[i]);
          }               
        }
        setListings(foundData);
      });
  }, [name]);

  async function submit() {
    await window.ethereum.request({ method: 'eth_requestAccounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
      .then((accounts) => {
        if (accounts.length > 0) {
          navigate("/")
        }
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
    <div className = 'browse'>
      <br/> <br/>
      <form>
         <label htmlFor="nftname">Search </label>
         <input
           type="text"
           name="nftName"
           value={name}
           onChange={onChangeHandler}
         />
       </form>
      <h2>List of Available NFTs</h2>
      <table className="table">
        <tbody>
          {
            listings.map((list, index) =>

              <div className= "card-container"  onClick={() => navigate('/nft?id=' + list._id)}>

              <div class= "nft-image">
                <figure style={{width: '30%'}}>
                <img className='browseImage' src={list.imageUrl}/>
                </figure>
              </div>

              <div className="nft-content">
              <p className="nft_Name" key="name" style={{width: '30%'}} >{list.name}</p>
              <p className="nftNumber" style={{width: '30%'}}>{index + 1}</p>
              </div>

              </div>                     
            )
          }
        </tbody>
      </table>
    </div>
  );
}
export default Browse;
