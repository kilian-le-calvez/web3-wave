const main = async () => {
    const [owner, randomUser] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy();
    await waveContract.deployed();

    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed from:", owner.address);
    console.log("\n---\n")

    // await waveContract.getTotalWaves();

    // Wave at the contract
    const firstWave = await waveContract.wave("First wave");
    await firstWave.wait();

    // await waveContract.getTotalWaves();

    // Simulate another user waving
    const secondWave = await waveContract.connect(randomUser).wave("Second Wave");
    await secondWave.wait();
    const newSecondWave = await waveContract.connect(randomUser).wave("Third Wabe");
    await newSecondWave.wait();

    await waveContract.getTotalWaves();
    await waveContract.getWaves();
};
  
const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    } catch (error) {
        console.log(error);
        process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
    // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
};
  
runMain();