// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IERC4907.sol";
import "./NFTer.sol";

contract NFTerEscrow is Ownable, IERC721Receiver 
{
    using SafeMath for uint256;
    using Address for address payable;

    struct ERC721Metadata {
        address owner;
        address operator;
        uint256 tokenId;
    }

    ERC721Metadata private _metadata;
    uint256 private _rentalExpires;
    mapping(address => uint256) private _deposits;
    NFTer parentInstance;

    constructor(NFTer _parentContract)
    {
        parentInstance = _parentContract;
    }

    //Receives ERC-721 NFTs
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public override onlyOwner returns (bytes4)
    {
        _metadata = ERC721Metadata({
            owner: abi.decode(data, (address)),
            operator: operator,
            tokenId: tokenId
        });
        parentInstance.childReceivedERC721NFT(operator, from, tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }

    //Receives ETH with no msg.data
    receive() external payable
    {
        uint256 amount = msg.value;
        _deposits[msg.sender] += amount;
        parentInstance.childReceivedETH(msg.sender, amount);
    }

    //Receives ETH with msg.data
    fallback() external payable
    {
        uint256 amount = msg.value;
        _deposits[msg.sender] += amount;
        parentInstance.childReceivedETH(msg.sender, amount);
    }

    function rentNFT(address renterAddress, uint64 expires) external onlyOwner
    {
        _rentalExpires = expires;
        IERC4907(_metadata.operator).setUser(_metadata.tokenId, renterAddress, expires);
    }

    function returnNFT() external onlyOwner returns (bool)
    {
        uint256 currentTime = getTime();
        if(currentTime > _rentalExpires)
        {
            ERC721(_metadata.operator).safeTransferFrom(address(this), _metadata.owner, _metadata.tokenId);
            parentInstance.childSelfDestructed(_metadata.operator, _metadata.owner, _metadata.tokenId);
            selfdestruct(payable(owner()));
            return true;
        }
        return false;
    }

    function releaseMoney(address depositor) external virtual onlyOwner returns (bool)
    {
        uint256 currentTime = getTime();
        if(currentTime > _rentalExpires)
        {
            uint256 amount = _deposits[depositor];
            _deposits[depositor] = 0;

            uint256 commission = (amount * parentInstance.commission_amount()) / 100;
            uint256 payment = amount - commission;
            payable(_metadata.owner).sendValue(payment);
            parentInstance.childPayedETH(depositor, _metadata.owner, payment);
            return true;
        }
        return false;
    }

    function refundMoney(address payable payee) external onlyOwner
    {
        uint256 payment = _deposits[payee];
        _deposits[payee] = 0;
        payee.sendValue(payment);
        parentInstance.childRefundedETH(payee, _metadata.owner, payment);

        _rentalExpires = getTime();
        //Set contract to be renter of NFT for 1 minute
        IERC4907(_metadata.operator).setUser(_metadata.tokenId, address(this), uint64(_rentalExpires + 60));
    }

    function getTime() private view returns (uint256)
    {
        return block.timestamp;
    }
}