const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentsChains, networkConfig } = require("../../helper-hardhat-config")

BET_AMOUNT = ethers.utils.parseEther("1")

!developmentsChains.includes(network.name)
    ? describe.skip
    : describe("PredictionMarket unit tests", async () => {
          let predictionMarket, deployer, Party, accounts

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

              accounts = await ethers.getSigners()
          })

          describe("Bet function", function () {
              it("places a bet on the election outcome", async () => {
                  await expect(predictionMarket.placeBet(Party.Republican, { value: BET_AMOUNT }))
                      .to.not.be.reverted
              })

              it("reverts if betamount is <= 0", async () => {
                  await expect(
                      predictionMarket.placeBet(Party.Republican, {
                          value: ethers.utils.parseEther("0"),
                      }),
                  ).to.be.revertedWith("PredictionMarket__NotEnoughEthSent")
              })
          })

          describe("Withdraw function", function () {
              it("if election is ongoing, you cant withdraw", async function () {
                  await predictionMarket.placeBet(Party.Republican, {
                      value: ethers.utils.parseEther("20"),
                  })

                  await expect(predictionMarket.withdrawGain()).to.be.revertedWith(
                      "PredictionMarket__ElectionNotFinished",
                  )
              })

              it("should allow a winning gambler to withdraw gains", async function () {
                  await predictionMarket.placeBet(Party.Democratic, {
                      value: ethers.utils.parseEther("0"),
                  })
                  await predictionMarket.placeBet(Party.Republican, {
                      value: ethers.utils.parseEther("20"),
                  })

                  await predictionMarket.reportResult(Party.Democratic, Party.Republican)

                  await expect(predictionMarket.withdrawGain()).to.be.reverted
              })
          })

          describe("Report result function", function () {
              it("already finished should be banned", async () => {
                  await predictionMarket.setEventState()
                  await expect(
                      predictionMarket.reportResult(Party.Democratic, Party.Republican),
                  ).to.not.be.revertedWith("PredictionMarket__ElectionFinished")
              })
          })
      })
