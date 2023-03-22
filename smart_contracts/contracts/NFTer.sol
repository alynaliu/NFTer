// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
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

    event ReceivedERC721NFT(address contractAddress, address from, uint256 tokenId);
    event EscrowReceivedERC721NFT(address contractAddress, address from, uint256 tokenId, address indexed escrow);
    event ReturnedERC721NFT(address contractAddress, address to, uint256 tokenId);
    event ReceivedETH(address from, uint256 amount, address escrow);
    event PayedETH(address renter, address owner, uint256 amount, address escrow);
    event RefundedETH(address renter, address owner, uint256 amount, address escrow);

    function childReceivedERC721NFT(address operator, address from, uint256 tokenId) external onlyEscrows
    {
        emit EscrowReceivedERC721NFT(operator, from, tokenId, msg.sender);
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
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external virtual override returns (bytes4)
    {
        createChild(msg.sender, from, tokenId);
        emit ReceivedERC721NFT(msg.sender, from, tokenId);
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

    function createChild(address contractAddress, address from, uint256 tokenId) private
    {
        NFTerEscrow escrow = new NFTerEscrow(this);
        escrows[contractAddress][tokenId] = escrow;
        activeEscrows[address(escrow)] = ERC721Metadata({
            owner: from,
            operator: contractAddress,
            tokenId: tokenId
        });
    }

    function sendChildERC721(address contractAddress, uint256 tokenId) external onlyOwner
    {
        require(address(escrows[contractAddress][tokenId]) != address(0), "Error: Escrow doesn't exist");
        NFTerEscrow escrow = escrows[contractAddress][tokenId];
        bytes memory encodedAddress = abi.encode(activeEscrows[address(escrow)]);
        IERC721(contractAddress).safeTransferFrom(address(this), address(escrow), tokenId, encodedAddress);
    }

    function childSelfDestructed(address contractAddress, address to, uint256 tokenId) external onlyEscrows 
    {
        delete escrows[contractAddress][tokenId];
        delete activeEscrows[msg.sender];
        emit ReturnedERC721NFT(contractAddress, to, tokenId);
    }

    function getTime() external view returns (uint256)
    {
        return block.timestamp;
    }

    function getEscrowAddress(address contractAddress, uint256 tokenId) external view returns (address)
    {
        return address(escrows[contractAddress][tokenId]);
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