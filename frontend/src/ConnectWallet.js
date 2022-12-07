import './styles/style.css';
import logo from './Images/MetaMask_Fox.png';

function ConnectWallet() {
    return (
      <div className='sign-in'>
      <h2>
       You need a crypto wallet to use NFTer.
      </h2>
      <div>
      <button><img src={logo} alt="Logo"/> MetaMask</button>
      </div>
      </div>
    );
  }
  
  export default ConnectWallet;
  