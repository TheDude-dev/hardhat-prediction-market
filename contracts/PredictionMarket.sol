// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/*
 * @title : Mini Prediction Market
 * @author Bonheur Balek's AKA The Dude
 * @notice This contract is for Betting on outcome of the 2024 election, chosing which party will win.
 * @dev This implements Oracles and some defi features
 */

error PredictionMarket__ElectionFinished();
error PredictionMarket__NotEnoughEthSent();

contract PredictionMarket {
    /* Types */

    // Which party will win the 2024 Election?
    enum Party {
        Democratic,
        Republican
    }

    /* State variable */

    // mapping of Total amount bet on one party
    mapping(Party => uint256) public bets;
    mapping(address => mapping(Party => uint)) public betsToGambler;

    // check if elction status
    bool public electionFinished;
    // address of the oracle we get the result from
    address public oracle;

    /* Market variables */

    /* Events */

    /* functions */

    constructor(address _oracle) {
        oracle = _oracle;
    }

    /* Main functions */

    // function to place a bet on the election outcome
    function placeBet(Party _party) external payable {
        // if election not finished revert
        if (electionFinished) {
            revert PredictionMarket__ElectionFinished();
        }
        if (msg.value <= 0) {
            revert PredictionMarket__NotEnoughEthSent();
        }
        bets[_party] += msg.value;
        betsToGambler[msg.sender][_party] += msg.value;
    }
}
