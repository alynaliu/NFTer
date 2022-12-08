// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./IERC4907.sol";

contract NFTer is Ownable, IERC721Receiver 
{
    event ReceivedERC721NFT(address indexed operator, address indexed from, uint256 tokenId, bytes data);
    event ReceivedETH(address indexed from, uint256 amount);

    //Need this function to receive ERC-721 NFTs
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external virtual override returns (bytes4)
    {
        emit ReceivedERC721NFT(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }

    //Need this to receive ETH with no msg.data
    receive() external payable
    {
        emit ReceivedETH(msg.sender, msg.value);
    }

    //Need this to receive ETH with msg.data
    fallback() external payable
    {
        emit ReceivedETH(msg.sender, msg.value);
    }

    function rentNFT(address contractAddress, uint256 tokenId, address renterAddress, uint64 expires) external onlyOwner
    {
        IERC4907(contractAddress).setUser(tokenId, renterAddress, expires);
    }

    //TODO: Put it in a timed escrow that will expire when the last listing expires.
    function returnNFT(address contractAddress, uint256 tokenId, address ownerAddress) external onlyOwner
    {
        ERC721(contractAddress).safeTransferFrom(address(this), ownerAddress, tokenId);
    }

    function payOwner(address payable _to, uint _amount) external onlyOwner {
        _to.transfer(_amount);
    }
}