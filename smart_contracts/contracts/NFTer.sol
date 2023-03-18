// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IERC4907.sol";
import "./NFTerEscrow.sol";

contract NFTer is Ownable, IERC721Receiver 
{
    using SafeMath for uint256;
    using Address for address payable;

    struct ERC721Metadata {
        address owner;
        address operator;
        uint256 tokenId;
    }

    uint256 public commission_amount = 2;
    mapping(address => mapping(uint256 => NFTerEscrow)) private escrows;
    mapping(address => ERC721Metadata) private activeEscrows;

    event ReceivedERC721NFT(address indexed operator, address indexed from, uint256 tokenId, address indexed escrow);
    event ReturnedERC721NFT(address indexed operator, address indexed to, uint256 tokenId);
    event ReceivedETH(address indexed from, uint256 amount, address indexed escrow);
    event PayedETH(address indexed renter, address indexed owner, uint256 amount, address indexed escrow);
    event RefundedETH(address indexed renter, address indexed owner, uint256 amount, address indexed escrow);

    function childReceivedERC721NFT(address operator, address from, uint256 tokenId) external onlyEscrows
    {
        emit ReceivedERC721NFT(operator, from, tokenId, msg.sender);
    }
    
    function childReceivedETH(address from, uint256 amount) external onlyEscrows
    {
        emit ReceivedETH(from, amount, msg.sender);
    }

    function childPayedETH(address renter, address owner, uint256 amount) external onlyEscrows
    {
        emit PayedETH(renter, owner, amount, msg.sender);
    }

    function childRefundedETH(address renter, address owner, uint256 amount) external onlyEscrows
    {
        emit RefundedETH(renter, owner, amount, msg.sender);
    }
    
    //Receives ERC-721 NFTs
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4)
    {
        createChild(operator, from, tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }

    //Receives ETH
    receive() external payable {}
    fallback() external payable {}

    function rentNFT(address contractAddress, uint256 tokenId, address renterAddress, uint64 expires) external onlyOwner
    {
        require(address(escrows[contractAddress][tokenId]) != address(0), "Error: Escrow doesn't exist");
        NFTerEscrow escrow = escrows[contractAddress][tokenId];
        escrow.rentNFT(renterAddress, expires);
    }

    function returnNFT(address contractAddress, uint256 tokenId) external onlyOwner returns (bool) 
    {
        require(address(escrows[contractAddress][tokenId]) != address(0), "Error: Escrow doesn't exist");
        NFTerEscrow escrow = escrows[contractAddress][tokenId];
        return escrow.returnNFT();
    }

    function payOwner(address contractAddress, uint256 tokenId, address _to) external onlyOwner returns (bool)
    {
        require(address(escrows[contractAddress][tokenId]) != address(0), "Error: Escrow doesn't exist");
        NFTerEscrow escrow = escrows[contractAddress][tokenId];
        return escrow.releaseMoney(_to);
    }

    function refundRenter(address contractAddress, uint256 tokenId, address payable _to) external onlyOwner
    {
        require(address(escrows[contractAddress][tokenId]) != address(0), "Error: Escrow doesn't exist");
        NFTerEscrow escrow = escrows[contractAddress][tokenId];
        escrow.refundMoney(_to);
    }

    function createChild(address operator, address from, uint256 tokenId) private
    {
        NFTerEscrow escrow = new NFTerEscrow(this);
        escrows[operator][tokenId] = escrow;
        activeEscrows[address(escrow)] = ERC721Metadata({
            owner: from,
            operator: operator,
            tokenId: tokenId
        });
        bytes memory encodedAddress = abi.encode(from);
        IERC721(operator).safeTransferFrom(msg.sender, address(escrow), tokenId, encodedAddress);
    }

    function childSelfDestructed(address operator, address to, uint256 tokenId) external onlyEscrows 
    {
        delete escrows[operator][tokenId];
        delete activeEscrows[msg.sender];
        emit ReturnedERC721NFT(operator, to, tokenId);
    }

    function getTime() external view returns (uint256)
    {
        return block.timestamp;
    }

    function getEscrowAddress(address operator, uint256 tokenId) external view returns (address)
    {
        return address(escrows[operator][tokenId]);
    }

    function getNFTDetails(address escrow) external view returns (address, uint256)
    {
        return (activeEscrows[escrow].operator, activeEscrows[escrow].tokenId);
    }

    modifier onlyEscrows()
    {
        _checkEscrows();
        _;
    }

    function _checkEscrows() internal view virtual
    {
        require(activeEscrows[_msgSender()].owner != address(0), "Ownable: caller is not an escrow");
    }
}