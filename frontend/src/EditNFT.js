import {useState, useEffect} from 'react'


function EditNFTListings() {

  const [data, setData] = useState({})

  useEffect(() =>{
    fetch("http://localhost:5000/api/nft/listing")
    .then(res => res.json())
    .then(data => setData(data))
  },[])
    return (
      <div>
      {data}
      </div>
    );
  }
  
  export default EditNFTListings;
  