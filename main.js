// src/App.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import tasksContractABI from "./artifacts/contracts/Tasks.sol/Tasks.json";

const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
const tasksABI = tasksContractABI.abi;

function App() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    getWallet();
  }, []);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      handleAccounts(accounts);
    }
  };

  const handleAccounts = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      getContract(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectWallet = async () => {
    if (!ethWallet) return alert("MetaMask wallet is required to connect");

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccounts(accounts);
  };

  const getContract = (account) => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, tasksABI, signer);

    setContract(contractInstance);
    loadContractData(contractInstance);
  };

  const loadContractData = async (contractInstance) => {
    const balance = await contractInstance.getBalance();
    setBalance(balance.toNumber());
  };

  const deposit = async () => {
    if (contract) {
      const amount = prompt("Enter amount to deposit:");
      const tx = await contract.deposit(amount, { value: ethers.utils.parseEther(amount) });
      await tx.wait();
      loadContractData(contract);
    }
  };

  const withdraw = async () => {
    if (contract) {
      const amount = prompt("Enter amount to withdraw:");
      const tx = await contract.withdraw(amount);
      await tx.wait();
      loadContractData(contract);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tasks Contract Interaction</h1>
        {!account ? (
          <button onClick={connectWallet}>Connect MetaMask</button>
        ) : (
          <div>
            <p>Connected Account: {account}</p>
            <p>Balance: {balance}</p>
            <button onClick={deposit}>Deposit</button>
            <button onClick={withdraw}>Withdraw</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
