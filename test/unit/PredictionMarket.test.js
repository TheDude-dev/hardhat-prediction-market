const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentsChains, networkConfig } = require("../../helper-hardhat-config")

BET_AMOUNT = ethers.utils.parseEther("1")

!developmentsChains.includes(network.name)
    ? describe.skip
    : describe("PredictionMarket unit tests", async () => {
          let predictionMarket, deployer, Party

          const chainId = network.config.chainId
          // Before anything
          // we deploy
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              predictionMarket = await ethers.getContractAt("PredictionMarket", deployer)

              Party = {
                  Democratic: 0,
                  Republican: 1,
              }
          })

          describe("Bet function", function () {
              it("places a bet on the election outcome", async () => {
                  await expect(predictionMarket.placeBet(Party.Republican, { value: BET_AMOUNT }))
                      .to.not.be.reverted
              })

              it("reverts if betamount is <= 0", async () => {
                  await expect(
                      predictionMarket.placeBet(Party.Republican, { value: 0 }),
                  ).to.be.revertedWith("PredictionMarket__NotEnoughEthSent")
              })
          })
      })
