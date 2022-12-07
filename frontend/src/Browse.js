import './styles/style.css';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from './Images/MetaMask_Fox.png';
import axios from "axios";

function Browse() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

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
        for (var i = 0; i < data.length; i++) {
          if (data[i].imageUrl === undefined || data[i].imageUrl === null) {
            console.log("Meow")
            data[i].imageUrl = logo;
          }
          else
          {
            console.log("Hi");
          }
        }
        setListings(data);
      });
  }, []);

  async function submit() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
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
    <div>
      <h2>List of Available NFTs</h2>
      <table className="table">
        <thead>
          <tr>
            <th key="name">Name</th>
          </tr>
        </thead>
        <tbody>
          {
            listings.map((list, index) =>
              <tr key={index}>
                <td> NFT {index + 1}</td>
                <td key="name" >{list.name}</td>
                <td>
                  <img className='browseImage' src={list.imageUrl} />
                  {console.log(list._id)}
                </td>
                <td>
                  <button id = {"button" + index} onClick={() => navigate('/nft?id=' + list._id)}> Rent </button>
                </td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}
export default Browse;
