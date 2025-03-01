// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    struct AuctionItem {
        string name;
        string description;
        uint256 startTime;
        uint256 duration;
        uint256 initialCost;
        uint256 minBidStep;
        uint256 timeStep;
        uint256 highestBid;
        address highestBidder;
        bool ended;
    }

    AuctionItem[] public auctions;
    address public owner;
    mapping(uint256 => mapping(address => uint256)) public bids;

    event AuctionCreated(uint256 auctionId, string name, uint256 startTime, uint256 duration);
    event BidPlaced(uint256 auctionId, address bidder, uint256 amount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 amount);

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createAuction(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _duration,
        uint256 _initialCost,
        uint256 _minBidStep,
        uint256 _timeStep
    ) public onlyOwner {
        auctions.push(AuctionItem({
            name: _name,
            description: _description,
            startTime: _startTime,
            duration: _duration,
            initialCost: _initialCost,
            minBidStep: _minBidStep,
            timeStep: _timeStep,
            highestBid: _initialCost,
            highestBidder: address(0),
            ended: false
        }));

        emit AuctionCreated(auctions.length - 1, _name, _startTime, _duration);
    }

    function placeBid(uint256 _auctionId) public payable {
        AuctionItem storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.startTime, "Auction has not started yet");
        require(block.timestamp <= auction.startTime + auction.duration, "Auction has ended");
        require(msg.value >= auction.highestBid + auction.minBidStep, "Bid must be higher than the current highest bid");

        if (auction.highestBidder != address(0)) {
            bids[_auctionId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    function endAuction(uint256 _auctionId) public onlyOwner {
        AuctionItem storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.startTime + auction.duration, "Auction has not ended yet");
        require(!auction.ended, "Auction already ended");

        auction.ended = true;
        payable(owner).transfer(auction.highestBid);

        emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
    }

    function getAuctions() public view returns (AuctionItem[] memory) {
        return auctions;
    }
}