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
    <div>
      <h2>Create Auction</h2>
      {error && <p style={{ color: error.includes('success') ? 'green' : 'red' }}>{error}</p>}
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="datetime-local" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="number" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
      <input type="number" step="0.01" placeholder="Initial Cost (ETH)" value={initialCost} onChange={(e) => setInitialCost(e.target.value)} />
      <input type="number" step="0.01" placeholder="Minimum Bid Step (ETH)" value={minBidStep} onChange={(e) => setMinBidStep(e.target.value)} />
      <input type="number" placeholder="Time Step (seconds)" value={timeStep} onChange={(e) => setTimeStep(e.target.value)} />
      <button onClick={createAuction}>Create Auction</button>
    </div>
  );
}

export default CreateAuction;