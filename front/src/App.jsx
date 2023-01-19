import React from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import { inheritable } from "ethers/utils/properties";

const hexToDecimal = hex => parseInt(hex, 16);
const maticPrecision = matic => matic / 1000000000000000000;
const getEthereumObject = () => window.ethereum;

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + (min / 10 < 1 ? '0' : '') + min + ':' + (sec / 10 < 1 ? '0' : '') + sec ;
  return time;
}

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default function App() {

  const [currentAccount, setCurrentAccount] = React.useState("");
  const contractAddress = "0x35afD91AdFBAebb42FAfb78EA1436FaCAC1092ff";
  const contractABI = abi.abi;
  const [totalWaves, setTotalWaves] = React.useState(0);
  const [clientBalance, setClientBalance] = React.useState(0);
  const [contractBalance, setContractBalance] = React.useState(0);
  const [waves, setWaves] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [isReverse, setIsReverse] = React.useState(true);
  const [canWave, setCanWave] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Refresh the brain every seconds
  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     refreshBrain();
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

/**
 * Listen in for emitter events!
 */
React.useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    refreshBrain();
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
   
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setIsLoading(true);
        setCanWave(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const messageToSend = message == "" ? "Zzzzz" : message;
        await wavePortalContract.wave(messageToSend);
        setMessage("");
        document.getElementById('textFieldMessage').value = ''
        let count = await wavePortalContract.getTotalWaves();
        setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setCanWave(false);
    }
    setIsLoading(false);
  }

  const getTotalWaves = React.useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log(count)
        // setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [contractABI]);

  const getWaves = React.useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,   contractABI, signer);
        let newWaves = await wavePortalContract.getWaves();
        setWaves([])
        for (var i = 0; i < newWaves.length; i++) {
          setWaves(waves => [...waves, newWaves[i]])
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [contractABI])

    const getBalance = React.useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,   contractABI, signer);
        let balance = await wavePortalContract.getBalance();
    setClientBalance(maticPrecision(hexToDecimal(balance.balance._hex)));
setContractBalance(maticPrecision(hexToDecimal(balance.contract_balance._hex)));
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [contractABI])

    const canSpam = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,   contractABI, signer);
        let canSpam = await wavePortalContract.canSpam();
        setCanWave(canSpam);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const refreshBrain = React.useCallback(async () => {
      getTotalWaves();
      // getWaves();
      // getBalance();
  }, [getBalance, getTotalWaves, getWaves])

  
  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      const account = await findMetaMaskAccount();
      if (account !== null) {
        setCurrentAccount(account);
        refreshBrain();
      }  
    }
    init();
  }, [refreshBrain]);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        🧠  Welcome to my brain - {totalWaves} neurons actives.
        </div>

        <div className="header">
        💰 Your balance : {clientBalance} 💸 Contract balance : {contractBalance}
        </div>

        <div className="bio">
          You know a brain works by connecting neurons together right?
          There are too much neurons I can't handle it myself.
          Connect your Polygon Mumbai wallet and help me !
          (It can take up to 30 seconds to connect a neuron)
        </div>

        <input id="textFieldMessage" placeholder="Your neuron will sleep if you do not type here !" onChange={(event) => { setMessage(event.target.value) }}></input>

        {
          isLoading ?
          <button className="waveButton inactive">
          ⌚️ The neuron is joining the army
        </button>
          :
          canWave ?
        <button className="waveButton" onClick={wave}>
          💡 Connect a neuron to the neuron network.
        </button>
          :
        <button className="waveButton inactive" onClick={canSpam}>
          🕰 No neuron available... (Click to actualize)
        </button>
        }

        <button className="waveButton" onClick={() => {setIsReverse(!isReverse)}}>
          🔄 Organize memory {isReverse ? " >> Latest" : " << Oldest"}
        </button>

        <div className="bio">
          {
            (isReverse ? waves.reverse() : waves).map((wave, index) => {
          return (
            <div key={index} className="card">
              <div>Address: {wave.waver}</div>
              <div>Time: {timeConverter(wave.timestamp)}</div>
              <div className="cardMessage">{wave.message} (Won {maticPrecision(hexToDecimal(wave.won._hex))} MATIC)</div>
            </div>)
        })}
        </div>
        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
