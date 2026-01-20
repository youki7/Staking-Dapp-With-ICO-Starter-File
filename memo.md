
- todo
    - user should be able to buy fractional ERC20 tokens




- Solidity
    - getter function for array and mapping 
      - for array, like PoolInfo[] public poolInfo; , getter is like:
        function poolInfo(uint256 index) external view returns(PoolInfo){ ... }
        - So, if you want a getter returns all items, you must write by yourself. 
            But also, if arr is too big it will exceed RPC response limitation. Then you should design pagination.
      - for mapping, like mapping(uint256 => mapping(address => UserInfo)) public userInfo;, getter is like
        function userInfo(uint256 _key1, address _key) external view returns(UserInfo){ ... }