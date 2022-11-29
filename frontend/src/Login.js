import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => {
                if(accounts.length > 0) {
                    navigate("/")
                }
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
            <button onClick={() => submit()}>Log in with Metamask</button>
        </div>
    );
}

export default Login;