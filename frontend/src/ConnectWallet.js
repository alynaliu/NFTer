import './styles/style.css';
import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import logo from './Images/MetaMask_Fox.png';
import nfter from './Images/NFTer.png';

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
        <img src ={nfter} alt ="NFTer"/>
      <div className='sign-in' >
      <h3>
       Connect your wallet.
      </h3>
      <p>
        We currently only support MetaMask. If you don’t have a wallet with MetaMask, <br/>
        you can select the provider to create a new wallet now.
      </p>
      <br/><br/>
      <div>
      <button><img src={logo} alt="Logo" padding='500px'/>MetaMask</button>
      </div>
      </div>
      <div className='footer'>
        this is the footer
        </div>
      </div>
    );
  }

  export default ConnectWallet;