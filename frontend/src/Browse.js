import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NoImage from './assets/NoImage.png';
import Nav from "./Nav";

function Browse() {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const onChangeHandler = event => {
    setSearchTerm(event.target.value);
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
        console.log(res.data);
        const data = res.data;
        const foundData = [];
        // display everything if search bar is blank, or filter results that user searched for only
        for (let i = 0; i < data.length; i++) {
          if(searchTerm === "" || data[i].name.toString().toLowerCase().includes(searchTerm.toString().toLowerCase()))
          {
            if (data[i].imageUrl === undefined || data[i].imageUrl === null) {
              data[i].imageUrl = NoImage;              
            }
            foundData.push(data[i]);
          }               
        }
        setListings(foundData);
      });
  }, [searchTerm]);

  return (
    <div>
      <Nav />
      <div className="hero is-fullheight-with-navbar">
        <div className="hero-body is-align-items-flex-start">
          <div className="container">
            <p className="subtitle has-text-centered">Showing available NFT listings only</p>
            <div className="is-flex is-justify-content-space-between">
              <p className="is-underlined">{listings.length} Results</p>
              <form>
                <label htmlFor="nftname">Search </label>
                <input
                  type="text"
                  name="nftName"
                  value={searchTerm}
                  placeholder='Enter NFT name..'
                  onChange={onChangeHandler}
                />
              </form>
            </div>
            <div className="is-flex is-flex-wrap-wrap is-justify-content-center my-1">
              {
                listings.map((list) =>
                  <div className="card nft_card" onClick={() => navigate('/nft?id=' + list._id)}>
                    <div className="card-image">
                      <figure className="image is-square">
                        <img className="has-ratio" src={list.imageUrl} />
                      </figure>
                    </div>
                    <div className="card-content has-text-centered">
                      <p>{list.name}</p>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}
export default Browse;