const { expect } = require('chai');

const expectedValue = 1;

describe('PredictionMarket', function () {
    let predictionMarket;

    beforeEach(async function () {
        const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
        predictionMarket = await PredictionMarket.deploy();
        await predictionMarket.deployed();
    });

    it('Should return the correct value', async function () {
        expect(await predictionMarket.placeBet()).to.equal(expectedValue);
    });

});