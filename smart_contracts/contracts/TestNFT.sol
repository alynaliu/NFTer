// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./IERC4907.sol";

contract TestNFT is ERC721Enumerable, Ownable, IERC4907 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    mapping (uint256  => address) private _users;
    mapping (uint256  => uint256) private _expirations;
    mapping (uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) ERC721(name_,symbol_)
    {
        //Start with NFT ID of 1
        _tokenIds.increment();
    }

    function mintNFT(address wAddress) public onlyOwner
    {
        uint tokenID = _tokenIds.current();
        _safeMint(wAddress, tokenID);
        _tokenIds.increment();
    }

    function setMetadata(uint256 tokenId, string memory metadata) public onlyOwner
    {
        _tokenURIs[tokenId] = metadata;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function setUser(uint256 tokenId, address user, uint64 expires) external
    {
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        _users[tokenId] = user;
        _expirations[tokenId] = uint256(expires);
        emit UpdateUser(tokenId, user, expires);
    }

    function userOf(uint256 tokenId) external view returns(address)
    {
        if(_expirations[tokenId] >=  block.timestamp){
            return _users[tokenId];
        }
        else{
            return address(0);
        }
    }

    function userExpires(uint256 tokenId) external view returns(uint256)
    {
        return _expirations[tokenId];
    }
}