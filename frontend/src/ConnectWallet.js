import {useState, useEffect} from 'react'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { authenticateAction } from "./comps/authenticate"

function ConnectWallet() {
  const navigate = useNavigate();
  async function submit() {
    const [ publicAddress, signature ] = await authenticateAction(navigate);

    axios.post('/api/nft/listing', { 
      blockchain: 'polygon',
      contractAddress: '0x622d8fea4603ba9edaf1084b407052d8b0a9bed7',
      tokenID: '1000633',
      publicAddress: '0x96a16f15Ea9204b3742156af19649DBfdAFd7B16'
    }, {
      params: {
        publicAddress: publicAddress,
        signature: signature
      }
    })
    .then((res) => {
      console.log(res.data)
    });
  }

    return (
      <div>
        <button onClick={() => submit()}>CLICK HERE FOR FUNC</button>
      </div>
    );
  }

  export default ConnectWallet;