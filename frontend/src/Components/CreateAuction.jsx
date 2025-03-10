import React, { useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

function CreateAuction({ account }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [initialCost, setInitialCost] = useState('');
  const [minBidStep, setMinBidStep] = useState('');
  const [timeStep, setTimeStep] = useState('');
  const [error, setError] = useState('');

  async function createAuction() {
    try {
      // Validate inputs
      if (!name || !startTime || !duration || !initialCost || !minBidStep || !timeStep) {
        setError('All fields are required except description.');
        return;
      }

      if (isNaN(initialCost) || isNaN(minBidStep) || isNaN(timeStep)) {
        setError('Initial cost, minimum bid step, and time step must be valid numbers.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      // Convert inputs to the correct format
      const startTimeInSeconds = Math.floor(new Date(startTime).getTime() / 1000); // Convert to Unix timestamp
      const durationInSeconds = duration * 60; // Convert minutes to seconds
      const timeStepInSeconds = timeStep; // Time step is already in seconds
      const initialCostInWei = ethers.utils.parseEther(initialCost.toString()); // Convert ETH to Wei
      const minBidStepInWei = ethers.utils.parseEther(minBidStep.toString()); // Convert ETH to Wei

      // Call the createAuction function in the smart contract
      const tx = await contractInstance.createAuction(
        name,
        description,
        startTimeInSeconds,
        durationInSeconds,
        initialCostInWei,
        minBidStepInWei,
        timeStepInSeconds
      );

      // Wait for the transaction to be mined
      await tx.wait();

      // Clear the form and show success message
      setName('');
      setDescription('');
      setStartTime('');
      setDuration('');
      setInitialCost('');
      setMinBidStep('');
      setTimeStep('');
      setError('Auction created successfully!');
    } catch (err) {
      console.error('Error creating auction:', err);
      setError('Failed to create auction. Check the console for details.');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Create Auction</h2>
        {error && <p className={`mb-4 ${error.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Description (optional)</label>
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              placeholder="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Initial Cost (ETH)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Initial Cost (ETH)"
              value={initialCost}
              onChange={(e) => setInitialCost(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Minimum Bid Step (ETH)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Minimum Bid Step (ETH)"
              value={minBidStep}
              onChange={(e) => setMinBidStep(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Time Step (seconds)</label>
            <input
              type="number"
              placeholder="Time Step (seconds)"
              value={timeStep}
              onChange={(e) => setTimeStep(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={createAuction}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6"
        >
          Create Auction
        </button>
      </div>
    </div>
  );
}

export default CreateAuction;
