// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address addr) external pure returns (uint256);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function symbol() external view returns (string memory);

    function totalSupply() external view returns (uint256);

    function name() external view returns (string memory);
}

contract TokenICO {
    address public owner;
    address public tokenAddress;
    uint256 public tokenSalePrice; // wei / per token
    uint256 public soldTokens;

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can perform this action"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function updateToken(address _tokenAddress) public onlyOwner {
        tokenAddress = _tokenAddress;
    }

    function udpateTokenSalePrice(uint256 _tokenSalePrice) public onlyOwner {
        tokenSalePrice = _tokenSalePrice;
    }

    function multipy(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyToken(uint256 _tokenAmount) public payable {
        require(
            msg.value == multipy(tokenSalePrice, _tokenAmount),
            "Insufficient Ether provided for the token purchase"
        );

        ERC20 token = ERC20(tokenAddress);
        require(
            _tokenAmount <= token.balanceOf(address(this)),
            "Insufficient ERC20 token store"
        );

        require(token.transfer(msg.sender, _tokenAmount * 10 ** 18));

        (bool success, ) = payable(owner).call{value: msg.value}("");
        require(success, "Transfer failed");
        soldTokens += _tokenAmount;
    }

    function getTokenDetails()
        public
        view
        returns (
            string memory name,
            string memory symbol,
            uint256 balance,
            uint256 supply,
            uint256 tokenPrice,
            address token
        )
    {
        ERC20 _token = ERC20(tokenAddress);
        return (
            _token.name(),
            _token.symbol(),
            _token.balanceOf(address(this)),
            _token.totalSupply(),
            tokenSalePrice,
            tokenAddress
        );
    }

    function withdrawAllTokens() public onlyOwner {
        ERC20 token = ERC20(tokenAddress);

        uint256 balance = token.balanceOf(address(this));

        require(balance > 0, "No tokens to withdraw");

        require(token.transfer(msg.sender, balance));
    }
}
