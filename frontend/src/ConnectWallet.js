import './styles/style.css';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from './Images/MetaMask_Fox.png';
import nfter from './Images/NFTer.png';

function ConnectWallet() {

  const navigate = useNavigate();

  useEffect(() => {
      window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts) => {
              if(accounts.length > 0) {
                console.log('Please connect to MetaMask.');
              }
          })
          .catch((error) =>{
              console.error(error);
              navigate('/bad-login');
          });
  }, []);

  async function submit() {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
          .then((accounts) => {
              if(accounts.length > 0) {
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