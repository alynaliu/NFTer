import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Browse() {
  const [listings, setListings] = useState([]);

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
        setListings([...res.data]);
      });
  }, []);

  return (
    <div>
      <h2>NFT List</h2>
      <table className="table">
        <thead>
          <tr>
            <th key="name">Name</th>
          </tr>
        </thead>
        <tbody>
          {
            listings.map((list, index) =>
              <tr>
                <td>{list.name}</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}
export default Browse;
