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

    constructor(string memory name_, string memory symbol_)
     ERC721(name_,symbol_)
     {
     }

    function setUser(uint256 tokenId, address user, uint64 expires) public virtual{
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        UserInfo storage info =  _users[tokenId];

        require(info.expires < block.timestamp, "Already rented to someone");

        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId,user,expires);
    }

    function userOf(uint256 tokenId)public view virtual returns(address){
        if( uint256(_users[tokenId].expires) >=  block.timestamp){
            return  _users[tokenId].user;
        }
        else{
            return address(0);
        }
    }

    function userExpires(uint256 tokenId) public view virtual returns(uint256){
        return _users[tokenId].expires;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    function time() public view returns (uint256) {
        return block.timestamp;
    }

    function airdropNfts(address[] calldata wAddresses) public onlyOwner {
        for (uint i = 0; i < wAddresses.length; i++) {
            _mintSingleNFT(wAddresses[i]);
        }
    }
    
    function _mintSingleNFT(address wAddress) private {
        uint newTokenID = _tokenIds.current();
        _safeMint(wAddress, newTokenID);
        _tokenIds.increment();
    }
}