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
        uint256 statuspaid;
        uint256 rejected;
    }

    AuctionItem[] public auctions;
    address public owner;
    mapping(uint256 => mapping(address => uint256)) public pendingPayments;

    event AuctionCreated(uint256 auctionId, string name, uint256 startTime, uint256 duration);
    event BidPlaced(uint256 auctionId, address bidder, uint256 amount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 amount);
    event PaymentReceived(uint256 auctionId, address payer, uint256 amount);

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
            ended: false,
            statuspaid: 0,
            rejected: 0
        }));

        emit AuctionCreated(auctions.length - 1, _name, _startTime, _duration);
    }

    function placeBid(uint256 _auctionId, uint256 _bidAmount) public {
        AuctionItem storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.startTime, "Auction has not started yet");
        require(block.timestamp <= auction.startTime + auction.duration, "Auction has ended");
        require(_bidAmount >= auction.highestBid + auction.minBidStep, "Bid must be higher than the current highest bid");

        if (auction.highestBidder != address(0)) {
            pendingPayments[_auctionId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = _bidAmount;
        auction.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, _bidAmount);
    }

    function endAuction(uint256 _auctionId) public onlyOwner {
        AuctionItem storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.startTime + auction.duration, "Auction has not ended yet");
        require(!auction.ended, "Auction already ended");

        auction.ended = true;
        pendingPayments[_auctionId][auction.highestBidder] += auction.highestBid;

        emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
    }

    function payPendingBid(uint256 _auctionId) public payable {
        AuctionItem storage auction = auctions[_auctionId];
        require(block.timestamp <= auction.startTime + auction.duration + 24 hours, "Payment period has ended");

        auction.statuspaid = 1;
        uint256 amount = pendingPayments[_auctionId][msg.sender];
        require(msg.value >= amount, "Insufficient payment");

        pendingPayments[_auctionId][msg.sender] = 0;
        payable(owner).transfer(amount);

        emit PaymentReceived(_auctionId, msg.sender, amount);
    }

    function payRejectedBidFine(uint256 _auctionId) public payable {
        AuctionItem storage auction = auctions[_auctionId];
        require(auction.rejected == 0, "Bid was not rejected");
        require(block.timestamp <= auction.startTime + auction.duration + 24 hours, "Payment period has ended");
    
        auction.rejected = 1; // Set the rejected status
        auction.statuspaid = 1; 
        uint256 rejectionFee = pendingPayments[_auctionId][msg.sender];
        require(msg.value >= rejectionFee, "Insufficient payment");

        pendingPayments[_auctionId][msg.sender] = 0;
        payable(owner).transfer(rejectionFee);

        emit PaymentReceived(_auctionId, msg.sender, rejectionFee);
    }

    function getAuctions() public view returns (AuctionItem[] memory) {
        return auctions;
    }

    function getPendingPayment(uint256 _auctionId, address _bidder) public view returns (uint256) {
        return pendingPayments[_auctionId][_bidder];
    }
}