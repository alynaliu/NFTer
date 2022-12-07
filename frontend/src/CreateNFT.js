import {useState, useEffect} from 'react'
import axios from 'axios';
import Login from "./Login";
import ConnectWallet from './ConnectWallet';
import { useNavigate } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"



function CreateNFTListing() {
  const navigate = useNavigate();
  const [data, setData] = useState([])
  async function create() {

    const [ publicAddress, signature ] = await authenticateAction(navigate);


  //useEffect(() =>{
    axios.get("/api/account/nfts", {
        
            publicAddress: '0x96a16f15Ea9204b3742156af19649DBfdAFd7B16',
            chain: 'polygon',
            contract: '0x622d8fea4603ba9edaf1084b407052d8b0a9bed7'
        }, {
            params: {
                publicAddress: publicAddress,
                signature: signature
            }
        

        })
      .then(res => {
        setData(res.data);
        console.log(res.data)
      });
    

  }

    //}
  
    
    return (
        <div>
        {data.map((datas) => 
            <div>{datas.name}</div>
            )
        }
        </div>
      );
 
    
  }

  
  export default CreateNFTListing;
  