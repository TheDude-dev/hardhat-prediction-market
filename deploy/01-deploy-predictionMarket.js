const { network, ethers } = require("hardhat")
const { developmentsChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if (developmentsChains.includes(network.name)) {
    //     //create subscription
    //     vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    //     vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    //     const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    //     const transactionReceipt = await transactionResponse.wait(1)
    //     subscriptionId = transactionReceipt.events[0].args.subId
    //     //Fund the subscription
    //     // USually we'd need the Link token on a real network
    //     await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    // } else {
    //     vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    //     subscriptionId = networkConfig[chainId]["subscriptionId"]
    // }

    // const entranceFee = networkConfig[chainId]["entranceFee"]
    // const gasLane = networkConfig[chainId]["gasLane"]
    // const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"]
    // const interval = networkConfig[chainId]["keepersUpdateInterval"]
    const args = []
    const predictionMarket = await deploy("PredictionMarket", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Market deployed!")

    // if (developmentsChains.includes(network.name)) {
    //     const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    //     await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
    // }

    if (!developmentsChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying...")
        await verify(predictionMarket.address, args)
    }
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "verify"]
