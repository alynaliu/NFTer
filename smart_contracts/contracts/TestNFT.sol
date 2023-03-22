// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./IERC4907.sol";

contract TestNFT is ERC721Enumerable, Ownable, IERC4907 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    struct UserInfo
    {
        address user;   // address of user role
        uint64 expires; // unix timestamp, user expires
    }

    mapping (uint256  => UserInfo) internal _users;
    mapping (uint256 => string) internal _tokenURIs;

    constructor(string memory name_, string memory symbol_) ERC721(name_,symbol_)
    {
        //Start with NFT ID of 1
        _tokenIds.increment();
    }

    function setUser(uint256 tokenId, address user, uint64 expires) public virtual
    {
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        UserInfo info =  _users[tokenId];

        require(info.expires < block.timestamp, "Already rented to someone");

        _users[tokenId] = UserInfo({
            user: user,
            expires: expires
        });
        emit UpdateUser(tokenId,user,expires);
    }

    function userOf(uint256 tokenId)public view virtual returns(address)
    {
        if( uint256(_users[tokenId].expires) >=  block.timestamp){
            return  _users[tokenId].user;
        }
        else{
            return address(0);
        }
    }

    function userExpires(uint256 tokenId) public view virtual returns(uint256)
    {
        return _users[tokenId].expires;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool)
    {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    function time() public view returns (uint256)
    {
        return block.timestamp;
    }
    
    function mintNFT(address wAddress, string memory metadata) public onlyOwner
    {
        uint newTokenID = _tokenIds.current();
        _safeMint(wAddress, newTokenID);
        _tokenIds.increment();
        _tokenURIs[newTokenID] = metadata;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function getCurrentTokenID() public view returns (uint256)
    {
        return _tokenIds.current();
    }
}