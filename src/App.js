import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const abi = [
    "function requestTokens() public",
    "function getBalance(address user) public view returns (uint256)"
];

const fetchBalance = async (userAddress, contractAddress, provider) => {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    console.log("Fetching balance for address:", userAddress);
    
    try {
        const balance = await contract.getBalance(userAddress);
        console.log("Balance:", balance.toString());
        return ethers.formatEther(balance);
    } catch (balanceError) {
        console.error("Error fetching balance:", balanceError);
        return "Error: " + balanceError.message;
    }
};

const checkContract = async (contractAddress, provider) => {
    console.log("Checking contract at address:", contractAddress);
    const bytecode = await provider.getCode(contractAddress);
    console.log("Contract bytecode:", bytecode);
    if (bytecode === '0x') {
        console.error("No contract found at the specified address");
        return false;
    }
    return true;
};

const checkNetwork = async (provider) => {
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "Chain ID:", network.chainId);
    if (network.chainId !== 12227332n) {
        console.warn("Connected to an unexpected network. Expected Chain ID: 12227332");
    }
};

function App() {
    const [balance, setBalance] = useState(0);
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [contractBalance, setContractBalance] = useState(0);
    const [isRequesting, setIsRequesting] = useState(false);
    const [lastRequestTime, setLastRequestTime] = useState(null);
    const [cooldownTime, setCooldownTime] = useState(0);

    const fetchAddressAndBalance = useCallback(async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await checkNetwork(provider);

            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            setAddress(userAddress);

            const contractAddress = "0x868491ee560156dfB0CEE6b5E2bf3191F1D0B180";
            
            const contractExists = await checkContract(contractAddress, provider);
            if (!contractExists) {
                setError('Contract not found at the specified address');
                setIsLoading(false);
                return;
            }

            // Get network information
            const network = await provider.getNetwork();
            console.log("Connected to network:", network.name, "Chain ID:", network.chainId);

            const userBalance = await fetchBalance(userAddress, contractAddress, provider);
            setBalance(userBalance);

            const contractBalance = await fetchBalance(contractAddress, contractAddress, provider);
            setContractBalance(contractBalance);

            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching address and balance:", error);
            setError('Error connecting to MetaMask or fetching balance. Please try again.');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            fetchAddressAndBalance();
        } else {
            setError('Please install MetaMask to use this app');
            setIsLoading(false);
        }
    }, [fetchAddressAndBalance]);

    useEffect(() => {
        let timer;
        if (cooldownTime > 0) {
            timer = setInterval(() => {
                setCooldownTime(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldownTime]);

    const requestTokens = async () => {
        setIsRequesting(true);
        setError('');
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = "0x868491ee560156dfB0CEE6b5E2bf3191F1D0B180";
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const tx = await contract.requestTokens();
            await tx.wait();
            setLastRequestTime(new Date().toLocaleString());
            setCooldownTime(3600); // Set cooldown for 1 hour (adjust as needed)
            
            // Fetch updated balances
            const userAddress = await signer.getAddress();
            const userBalance = await fetchBalance(userAddress, contractAddress, provider);
            setBalance(userBalance);
            const contractBalance = await fetchBalance(contractAddress, contractAddress, provider);
            setContractBalance(contractBalance);
        } catch (error) {
            console.error("Error requesting tokens:", error);
            if (error.reason === "Tokens already requested") {
                setError('You have already requested tokens. Please try again later.');
                setCooldownTime(3600); // Set cooldown for 1 hour (adjust as needed)
            } else {
                setError('Error requesting tokens. Please try again.');
            }
        } finally {
            setIsRequesting(false);
        }
    };

    const formatCooldownTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="text-3xl font-bold text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Token Faucet</h1>
                        
                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Your Address</h2>
                                <p className="text-sm text-gray-500 break-all">{address}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Your Balance</h2>
                                <p className="text-3xl font-bold text-green-600">{balance} Tokens</p>
                            </div>
                        </div>

                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">Contract Balance</h2>
                            <p className="text-xl font-semibold text-blue-600">{contractBalance} Tokens</p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={requestTokens}
                                disabled={isRequesting || cooldownTime > 0}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                    isRequesting || cooldownTime > 0
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                            >
                                {isRequesting ? 'Requesting...' : cooldownTime > 0 ? `Try again in ${formatCooldownTime(cooldownTime)}` : 'Request Tokens'}
                            </button>
                        </div>

                        {lastRequestTime && (
                            <div className="mt-4 text-center text-sm text-gray-500">
                                Last request: {lastRequestTime}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;