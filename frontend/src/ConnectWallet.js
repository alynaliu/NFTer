import './styles/style.css';
import logo from './Images/MetaMask_Fox.png';
import nfter from './Images/NFTer.png';

function ConnectWallet() {
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
  