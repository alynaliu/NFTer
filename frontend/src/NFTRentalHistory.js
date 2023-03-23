import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"
import NoImage from './assets/NoImage.png';
import Nav from "./Nav";


function NFTRentalHistory(){

    
    const [searchParams] = useSearchParams();
    const [listing, setListing] = useState([]);
    const [isAuthenticated, setAuthenticated] = useState();
    const [account, setAccount] = useState([]);
    const [name, setName] = useState([]);
    const [listings, setListings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [nft, setNFT] = useState([])



    useEffect(() => {
      window.ethereum.request({ method: 'eth_accounts', params: [{networkId: process.env.REACT_APP_NETWORK_ID}] })
      .then((accounts) => {
          if(accounts.length === 0) {
              navigate('/login');
          }
          
      })
      .catch((error) =>{
          console.error(error);
          navigate('/login');
      });
  }, []);


    const onChangeHandler = event => {
      setSearchTerm(event.target.value);
    };
  
    // fetch the rented NFTs 
    useEffect(() => {
      const run = async() =>{
        const [publicAddress, signature] = await authenticateAction(navigate);
        axios
        .get("/api/nft/rent", {
          params: {
            publicAddress: publicAddress,
            signature: signature
          },
        })
        .then((res) => {
          console.log(res.data);
          const data = res.data;
          const foundData = [];
          console.log(data)
          // display everything if search bar is blank, or filter results that user searched for only
          // for (let i = 0; i < data.length; i++) {
          //   if(searchTerm === "" || data[i].name.toString().toLowerCase().includes(searchTerm.toString().toLowerCase()))
          //   {
          //     if (data[i].imageUrl === undefined || data[i].imageUrl === null) {
          //       data[i].imageUrl = NoImage;              
          //     }
          //     foundData.push(data[i]);
          //   }               
          // }
          setListings(foundData);
        });
      }
 
      
       run();
    }, [searchTerm]);


    return (
      <div>
        <Nav />
        <div className="hero is-fullheight-with-navbar">
          <div className="hero-body is-align-items-flex-start">
            <div className="container">
              <p className="subtitle has-text-centered">Showing NFT Rental listings History</p>
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

export default NFTRentalHistory;