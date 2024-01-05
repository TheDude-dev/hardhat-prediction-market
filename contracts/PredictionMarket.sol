// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/*
 * @title : Mini Prediction Market
 * @author Bonheur Balek's AKA The Dude
 * @notice This contract is for Betting on the outcome of the 2024 election, chosing which party will win.
 * @dev This implements Oracles and some defi features
 */

error PredictionMarket__ElectionFinished();
error PredictionMarket__NotEnoughEthSent();
error PredictionMarket__ElectionNotFinished();
error PredictionMarket__NoWinningBets();
error PredictionMarket__TransferFailed();
error PredictionMarket_NotOracle();

contract PredictionMarket {
    /* Types */

    // Which party will win the 2024 Election?
    enum Party {
        Democratic,
        Republican
    }

    enum EventState {
        ONGOING,
        FINISHED
    }

    struct Result {
        Party winner;
        Party loser;
    }

    /* State variable */
    Result public s_result;

    // mapping of Total amount bet on one party
    mapping(Party => uint256) public bets;
    mapping(address => mapping(Party => uint)) public betsToGambler;

    // check if elction status
    EventState public s_eventstate;
    // address of the oracle we get the result from
    address public oracle;

    /* Market variables */

    /* Events */
    event GamblerPaid(address indexed gambler, uint256 indexed gain);
    event BetPlaced(address indexed gambler, uint256 indexed bet);

    // event ResultReported(Result indexed winningParty, Result indexed losingParty);

    /* functions */

    constructor() {
        // oracle = _oracle;
        s_eventstate = EventState.ONGOING;
    }

    /* Main functions */

    // to place a bet on the election outcome
    function placeBet(Party _party) external payable {
        // if election not finished revert
        if (s_eventstate != EventState.ONGOING) {
            revert PredictionMarket__ElectionFinished();
        }
        // if eth not sent revert
        if (msg.value == 0) {
            revert PredictionMarket__NotEnoughEthSent();
        }
        bets[_party] += msg.value;
        betsToGambler[msg.sender][_party] += msg.value;

        emit BetPlaced(msg.sender, msg.value);
    }

    function withdrawGain() external {
        if (s_eventstate != EventState.FINISHED) {
            revert PredictionMarket__ElectionNotFinished();
        }

        uint gamblerBet = betsToGambler[msg.sender][s_result.winner]; // On if on winning side
        if (gamblerBet < 0) {
            revert PredictionMarket__NoWinningBets();
        }

        // Gain is proportianal to the initial bet of the winner and the loser pool
        uint gain = gamblerBet + (bets[s_result.loser] * gamblerBet) / bets[s_result.winner];

        // Reinitialize the pools
        betsToGambler[msg.sender][Party.Democratic] = 0;
        betsToGambler[msg.sender][Party.Republican] = 0;
        (bool success, ) = payable(msg.sender).call{value: gain}("");
        if (!success) {
            revert PredictionMarket__TransferFailed();
        }

        emit GamblerPaid(msg.sender, gain);
    }

    function reportResult(Party _winner, Party _loser) external {
        // if (oracle != msg.sender) {
        //     revert PredictionMarket_NotOracle();
        // }
        if (s_eventstate != EventState.ONGOING) {
            revert PredictionMarket__ElectionFinished();
        }

        s_result.winner = _winner;
        s_result.loser = _loser;
        s_eventstate = EventState.FINISHED;

        // emit ResultReported(s_result.winner, s_result.loser);
    }

    function setEventState() external {
        s_eventstate =EventState.FINISHED;
    }
}
